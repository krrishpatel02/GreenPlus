import { useSearchParams } from "react-router-dom";

const useDashboardNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const setActiveTab = (tab) => setSearchParams({ tab });

  return { activeTab, setActiveTab };
};

export default useDashboardNavigation;
