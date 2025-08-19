import { useNavigate } from "react-router-dom";
import ProductCompIcon from "../../icons/ProductCompIcon";

export default function TopBarSecondary() {
  const navigate = useNavigate();

  return (
    <div className="relative h-[56px] bg-white border-b border-[#D0D5DD] flex items-center justify-center px-[48px]">
      <div
        onClick={() => navigate("/")}
        className="flex flex-col items-center gap-[4px] cursor-pointer"
      >
        <div className="text-[12px] text-[#667085]">Compare Products</div>
        <div className="w-[32px] h-[32px] rounded bg-[#1570EF] flex items-center justify-center">
          <ProductCompIcon className="text-white" />
        </div>
      </div>
    </div>
  );
}
