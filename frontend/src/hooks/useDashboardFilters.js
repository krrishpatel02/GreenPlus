import { useMemo } from "react";

const useDashboardFilters = ({ schemes, schemeSearch, schemeCategoryFilter, researchModules, researchSearch, researchModuleFilter }) => {
  const filteredSchemes = useMemo(() => {
    const query = schemeSearch.toLowerCase();
    return schemes.filter((scheme) => {
      const matchesSearch = scheme.title.toLowerCase().includes(query) || scheme.desc.toLowerCase().includes(query);
      const matchesCategory = schemeCategoryFilter === "All" || scheme.category === schemeCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [schemes, schemeSearch, schemeCategoryFilter]);

  const filteredResearchModules = useMemo(() => {
    const query = researchSearch.trim().toLowerCase();
    return researchModules.filter((module) => {
      const matchesModule = researchModuleFilter === "All" || module.number === researchModuleFilter;
      const searchableText = `${module.title} ${module.summary} ${module.sources.map(([title]) => title).join(" ")}`.toLowerCase();
      return matchesModule && (!query || searchableText.includes(query));
    });
  }, [researchModules, researchModuleFilter, researchSearch]);

  return { filteredSchemes, filteredResearchModules };
};

export default useDashboardFilters;
