import React from "react";
import BasicMetadataSettings from "../../src/features/settings/basic-metadata";

export default function SettingsSeasonsRoute() {
  // Basic metadata manages brands/years/seasons together; render it directly.
  return <BasicMetadataSettings />;
}
