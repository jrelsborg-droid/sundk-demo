import { loadHomepageData } from "@/lib/data/loadHomepageData";
import HomepageClient from "@/components/HomepageClient";

export default function Page() {
  const data = loadHomepageData();
  return <HomepageClient data={data} />;
}