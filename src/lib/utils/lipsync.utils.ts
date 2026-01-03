/**
 * Enhanced LipSync Analyzer with viseme detection
 * Analyzes audio frequencies to detect vowel-like sounds
 */
export class LipSyncAnalyzer {
    private context: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array<ArrayBuffer> | null = null;

    // Smoothed values for fluid animation
    private smoothedVolume = 0;
    private smoothedVisemes = { a: 0, i: 0, u: 0, e: 0, o: 0 };

    init(stream: MediaStream) {
        try {
            if (this.context) {
                this.cleanup();
            }
            this.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.4;

            const source = this.context.createMediaStreamSource(stream);
            source.connect(this.analyser);

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
        } catch (e) {
            console.error("Failed to initialize LipSyncAnalyzer:", e);
        }
    }

    /**
     * Get overall volume (0-1)
     */
    getVolume(): number {
        if (!this.analyser || !this.dataArray) return 0;

        this.analyser.getByteFrequencyData(this.dataArray);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }

        const average = sum / this.dataArray.length;
        const rawVolume = Math.min(1, average / 50);

        // Smooth the volume for fluid animation
        this.smoothedVolume = this.lerp(this.smoothedVolume, rawVolume, 0.3);

        return this.smoothedVolume;
    }

    /**
     * Get viseme values for different mouth shapes
     * Returns values 0-1 for each vowel shape
     */
    getVisemes(): { a: number; i: number; u: number; e: number; o: number; volume: number } {
        if (!this.analyser || !this.dataArray) {
            return { a: 0, i: 0, u: 0, e: 0, o: 0, volume: 0 };
        }

        this.analyser.getByteFrequencyData(this.dataArray);

        // Frequency bin analysis
        // Sample rate is typically 48000Hz, FFT size 256 = 128 bins
        // Each bin covers ~187Hz
        // Low freq (0-500Hz): bins 0-2 - vowel fundamentals
        // Mid-low (500-1500Hz): bins 3-8 - first formant
        // Mid (1500-3000Hz): bins 8-16 - second formant
        // High (3000+Hz): bins 16+ - consonants/sibilants

        const binCount = this.dataArray.length;

        // Get energy in different frequency bands
        const lowEnergy = this.getEnergyInRange(0, Math.floor(binCount * 0.1));      // ~0-500Hz
        const midLowEnergy = this.getEnergyInRange(Math.floor(binCount * 0.1), Math.floor(binCount * 0.25)); // ~500-1500Hz
        const midEnergy = this.getEnergyInRange(Math.floor(binCount * 0.25), Math.floor(binCount * 0.5));    // ~1500-3000Hz
        const highEnergy = this.getEnergyInRange(Math.floor(binCount * 0.5), binCount);  // ~3000Hz+

        const totalEnergy = lowEnergy + midLowEnergy + midEnergy + highEnergy;

        if (totalEnergy < 5) {
            // Silent - decay all visemes
            this.smoothedVisemes.a = this.lerp(this.smoothedVisemes.a, 0, 0.15);
            this.smoothedVisemes.i = this.lerp(this.smoothedVisemes.i, 0, 0.15);
            this.smoothedVisemes.u = this.lerp(this.smoothedVisemes.u, 0, 0.15);
            this.smoothedVisemes.e = this.lerp(this.smoothedVisemes.e, 0, 0.15);
            this.smoothedVisemes.o = this.lerp(this.smoothedVisemes.o, 0, 0.15);
            this.smoothedVolume = this.lerp(this.smoothedVolume, 0, 0.15);
            return { ...this.smoothedVisemes, volume: this.smoothedVolume };
        }

        // Calculate relative proportions
        const lowRatio = lowEnergy / totalEnergy;
        const midLowRatio = midLowEnergy / totalEnergy;
        const midRatio = midEnergy / totalEnergy;
        const highRatio = highEnergy / totalEnergy;

        // Map to visemes based on frequency characteristics
        // A: Open mouth, low frequency dominant
        // I: Wide, high frequency
        // U: Round, low-mid frequency, less high
        // E: Semi-open, mid-high frequency
        // O: Round, mid frequency

        const rawA = Math.min(1, lowRatio * 2 + midLowRatio * 0.5);
        const rawI = Math.min(1, midRatio * 1.5 + highRatio * 1.2);
        const rawU = Math.min(1, midLowRatio * 1.5 - highRatio * 0.5);
        const rawE = Math.min(1, midRatio * 1.2 + midLowRatio * 0.8);
        const rawO = Math.min(1, lowRatio * 0.8 + midLowRatio * 1.2);

        // Normalize so they don't all fire at once
        const maxRaw = Math.max(rawA, rawI, rawU, rawE, rawO, 0.001);
        const volume = Math.min(1, totalEnergy / 100);

        // Smooth transitions (higher lerp = faster, lower = smoother)
        const lerpFactor = 0.2;
        this.smoothedVisemes.a = this.lerp(this.smoothedVisemes.a, (rawA / maxRaw) * volume, lerpFactor);
        this.smoothedVisemes.i = this.lerp(this.smoothedVisemes.i, (rawI / maxRaw) * volume, lerpFactor);
        this.smoothedVisemes.u = this.lerp(this.smoothedVisemes.u, (rawU / maxRaw) * volume, lerpFactor);
        this.smoothedVisemes.e = this.lerp(this.smoothedVisemes.e, (rawE / maxRaw) * volume, lerpFactor);
        this.smoothedVisemes.o = this.lerp(this.smoothedVisemes.o, (rawO / maxRaw) * volume, lerpFactor);
        this.smoothedVolume = this.lerp(this.smoothedVolume, volume, lerpFactor);

        return { ...this.smoothedVisemes, volume: this.smoothedVolume };
    }

    private getEnergyInRange(start: number, end: number): number {
        if (!this.dataArray) return 0;
        let sum = 0;
        for (let i = start; i < end && i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / Math.max(1, end - start);
    }

    private lerp(current: number, target: number, factor: number): number {
        return current + (target - current) * factor;
    }

    cleanup() {
        try {
            if (this.context && this.context.state !== 'closed') {
                this.context.close();
            }
        } catch (e) {
            console.warn("Error closing AudioContext:", e);
        }
        this.context = null;
        this.analyser = null;
        this.dataArray = null;
        this.smoothedVolume = 0;
        this.smoothedVisemes = { a: 0, i: 0, u: 0, e: 0, o: 0 };
    }
}
