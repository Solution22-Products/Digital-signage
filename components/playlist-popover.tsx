"use client";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PlaylistProps {
  PlaylistValue: string | null;
  setPlaylistValue: any;
  playlistList: any;
  selectedPlaylistId: any;
  setSelectedPlaylistId: any;
}

const PlaylistPopover: React.FC<PlaylistProps> = ({
  PlaylistValue,
  setPlaylistValue,
  playlistList,
  selectedPlaylistId,
  setSelectedPlaylistId,
}) => {
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [PlaylistSearchQuery, setPlaylistSearchQuery] = useState("");

  const filteredPlaylistFolders = playlistList.filter((playlist: any) => {
    return playlist.playlistName
      .toLowerCase()
      .includes(PlaylistSearchQuery.toLowerCase());
  });

  useEffect(() => {
    if (selectedPlaylistId) {
      setPlaylistValue(selectedPlaylistId);
    }
  }, [selectedPlaylistId]);

  return (
    <>
      <Popover open={playlistOpen} onOpenChange={setPlaylistOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={playlistOpen}
            className="w-full justify-between"
          >
            {PlaylistValue
              ? playlistList.find(
                  (playlist: any) => playlist.id === PlaylistValue
                )?.playlistName
              : "Select Playlist"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <div className="relative" style={{ width: "auto" }}>
          <PopoverContent className={`w-[90vw] mx-auto p-0`}>
            <Command>
              <Input
                placeholder="Search Playlist..."
                value={PlaylistSearchQuery}
                className="rounded-none"
                onChange={(e: any) => setPlaylistSearchQuery(e.target.value)}
              />
              <CommandList>
                {filteredPlaylistFolders.length === 0 ? (
                  <CommandEmpty className="max-h-[60px] h-[30px] flex justify-center pt-1">
                    No Playlist found
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filteredPlaylistFolders.map((playlist: any) => (
                      <CommandItem
                        key={playlist.id}
                        value={playlist.id}
                        onSelect={(currentValue) => {
                          const selectedValue =
                            currentValue === PlaylistValue
                              ? null
                              : currentValue;
                          setPlaylistValue(selectedValue);
                          setSelectedPlaylistId(selectedValue);
                          setPlaylistOpen(false);
                          console.log("selectedValue", selectedValue);
                        }}
                        className={cn(
                          "flex items-center justify-between",
                          PlaylistValue === playlist.id && "bg-gray-200"
                        )}
                      >
                        <div className="flex items-center">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              PlaylistValue === playlist.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {playlist.playlistName}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </div>
      </Popover>
    </>
  );
};

export default PlaylistPopover;
