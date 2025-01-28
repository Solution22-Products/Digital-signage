import { Search } from "lucide-react";
import { Input } from "./ui/input";
import React from "react";

interface GlobalSearchBarProps {
  searchValue: string | null;
  setSearchValue: (value: string) => void;
}

const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  searchValue,
  setSearchValue,
}) => {
  const handleScreenSearch = (e: any) => {
    setSearchValue?.(e.target.value);
    // console.log("search value", e.target.value);
  };
  return (
    <>
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Search"
          className="pl-10"
          defaultValue={searchValue?.toString() ?? ""}
          onChange={handleScreenSearch}
        />
        <Search
          className="absolute left-3 top-[42%] -translate-y-1/2 text-secondary_color"
          size={16}
        />
      </div>
    </>
  );
};

export default GlobalSearchBar;
