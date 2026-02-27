import BottomNav from "@/components/BottomNav";
import "react-datepicker/dist/react-datepicker.css";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pb-20">
        {children}
      </div>

      <BottomNav />
    </>
  );
}