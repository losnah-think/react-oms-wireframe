import React from "react";
import BasicMetadataSettings from "../../src/features/settings/basic-metadata";

export default function SettingsYearsRoute() {
  // Basic metadata manages brands/years/seasons together; render it directly.
  return <BasicMetadataSettings />;
}
