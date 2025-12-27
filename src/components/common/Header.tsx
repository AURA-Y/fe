import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-slate-100 bg-white px-4 md:px-6 lg:px-8">
      {/* Left Side: Logo & Main Nav */}
      <div className="flex items-center gap-8">
        <a href="/" className="text-2xl font-bold tracking-tight text-blue-600">
          AURA
        </a>
      </div>

      {/* Right Side: Actions & Buttons */}
      <div className="flex items-center gap-2 md:gap-6">
        <button className="text-slate-600 hover:text-blue-600">
          <Search className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-6 xl:flex">
          <Link
            href={"/attend"}
            className="text-[15px] font-medium text-slate-600 hover:text-blue-600"
          >
            Meeting
          </Link>
          <Link
            href={"/login"}
            className="text-[15px] font-medium text-slate-600 hover:text-blue-600"
          >
            Sign In
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="hidden h-auto rounded-full border-blue-600 px-5 py-2 text-[15px] font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-600 md:block"
          >
            <Link href={"/login"}>Login</Link>
          </Button>
          <Button className="h-auto rounded-full bg-blue-600 px-5 py-2 text-[15px] font-bold text-white hover:bg-blue-700">
            <Link href={"/signup"}>Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
