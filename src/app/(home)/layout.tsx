import Header from "@/components/common/Header";
import MainSideBar from "@/components/common/MainSideBar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="flex">
        <MainSideBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
