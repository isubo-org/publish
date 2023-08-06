import { defineConstStruct } from "../util/index.js";

export const enumReleaseTagType = defineConstStruct({
  ALPHA: 'alpha',
  BETA: 'beta',
  RC: 'rc'
});

export const enumPublishTagType = defineConstStruct({
  ...enumReleaseTagType,
  LATEST: 'latest'
});

