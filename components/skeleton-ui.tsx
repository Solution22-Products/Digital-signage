import { Skeleton } from "./ui/skeleton";

interface Props {
  height?: string;
  width?: string;
}

const DefaultSkeleton = () => {
  return (
    <main className="pt-4 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((id) => (
        <div key={id} className="grid-flow-col auto-cols-max gap-12">
          <Skeleton className="bg-gray-300 p-3 w-[250px]">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[160px]" />
                <Skeleton className="h-4 w-[110px]" />
              </div>
            </div>
          </Skeleton>
        </div>
      ))}
    </main>
  );
};

const FolderSkeleton = () => {
  return (
    <main className="pt-4 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-3 gap-5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((id) => (
        <div key={id} className="grid-flow-col auto-cols-max gap-12">
          <Skeleton className="bg-gray-300 p-3 md:w-[200px] lg:w-[220px] xl:w-[250px] 2xl:w-[230px]">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[110px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            </div>
          </Skeleton>
        </div>
      ))}
    </main>
  );
};

const ContentSkeleton = () => {
  return (
    // <main className="pt-4 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
    <div className="flex flex-wrap items-center gap-3">
      {Array.from({ length: 15 }, (_, i) => i + 1).map((id) => (
        <div key={id} className="grid-flow-col auto-cols-max gap-12">
          <Skeleton className="bg-gray-300 h-[100px] w-[100px] p-3">
            <div className="flex items-center justify-end space-x-4">
              {/* <Skeleton className="h-5 w-5 rounded-full" /> */}
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </Skeleton>
        </div>
      ))}
    </div>
    // </main>
  );
};

const LayoutSkeleton: React.FC<{ height: any; width: any }> = ({
  height,
  width,
}) => {
  return (
    <main className="pt-4 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((id) => (
        <div key={id} className="grid-flow-col auto-cols-max gap-12">
          <Skeleton className="bg-gray-300 h-[148px] w-[228px] p-3">
            {/* <div className="flex items-center justify-center space-x-4 h-full">
                  <Skeleton className={`h-[${height}px] w-[${width}px] rounded`} />
                </div> */}
          </Skeleton>
        </div>
      ))}
    </main>
  );
};

const UploadProfileSkeleton = () => {
  return (
    <div className="flex flex-col flex-wrap items-center gap-3">
      <Skeleton className="h-32 w-32 rounded-full mx-auto" />
      {Array.from({ length: 5 }, (_, i) => i + 1).map((id) => (
        <div key={id} className="w-1/2 space-y-3 mx-auto mt-4">
          <Skeleton className="h-5 w-[150px] rounded mb-3" />
          <Skeleton className="bg-gray-300 h-[35px] w-full p-3"></Skeleton>
        </div>
      ))}
    </div>
  );
};

const GeneralSettingsSkeleton = () => {
  return (
    <div className="flex flex-col flex-wrap items-center gap-3">
      <div className="flex gap-6">
        <Skeleton className="h-32 w-32 rounded-full mx-auto" />
        <Skeleton className="h-32 w-32 rounded-full mx-auto" />
      </div>
      <div className="flex gap-3 w-full">
        {Array.from({ length: 2 }, (_, i) => i + 1).map((id) => (
          <div key={id} className="w-1/2 space-y-3 mx-auto mt-4">
            <Skeleton className="h-5 w-[150px] rounded mb-3" />
            <Skeleton className="bg-gray-300 h-[35px] w-full p-3"></Skeleton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefaultSkeleton;
export {
  GeneralSettingsSkeleton,
  FolderSkeleton,
  ContentSkeleton,
  LayoutSkeleton,
  UploadProfileSkeleton,
};
