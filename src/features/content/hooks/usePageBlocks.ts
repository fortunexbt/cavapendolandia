import { useQuery } from "@tanstack/react-query";
import { pageContentRepo, type PageContentBlock } from "../api/pageContent.repo";

export const usePageBlocks = (slug: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["page-blocks", slug],
    queryFn: () => pageContentRepo.listBySlug(slug),
    enabled: !!slug,
  });

  const blockMap = new Map<string, PageContentBlock>();
  if (data) {
    for (const block of data) {
      blockMap.set(block.block_key, block);
    }
  }

  const getBlock = (key: string): PageContentBlock | null => {
    return blockMap.get(key) ?? null;
  };

  return { blocks: data ?? [], blockMap, getBlock, isLoading, isError };
};
