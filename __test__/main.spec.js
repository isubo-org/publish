import { describe, test, expect } from "@jest/globals";
import { getPublishCmdBy } from "../main.js";
import { parseTagFrom } from "../src/util/common.js";
import prompts from 'prompts';

describe('', () => {
  test.each([
    {
      name: 'alpha',
      versions: ['0.0.1-alpha.0'],
      expectTag: 'alpha'
    },
    {
      name: 'beta',
      versions: ['0.0.1-beta.0'],
      expectTag: 'beta'
    },
    {
      name: 'rc',
      versions: ['0.0.1-rc.0'],
      expectTag: 'rc'
    },
    {
      name: 'non tag',
      versions: ['0.0.1-0', '0.0.1', '0.0.1-random.0'],
      expectTag: ''
    },
  ])('parseTagFrom version to get $name', ({ versions, expectTag }) => {
    for (const version of versions) {
      const tag = parseTagFrom({ version });
      expect(tag).toEqual(expectTag);
    }
  });

  test.each([
    {
      name: 'publish to alpha',
      version: '0.0.1-alpha.0',
      expectTag: 'alpha'
    },
    {
      name: 'publish to latest',
      version: '0.0.1',
      expectTag: 'latest'
    },
    {
      name: 'publish to latest',
      version: '0.0.1-0',
      expectTag: 'latest',
      injectFunc: () => {
        const value = ['latest'];
        prompts.inject([value]);
      }
    },
  ])('getPublishCmdBy version, $name', async ({ expectTag, version, injectFunc }) => {
    injectFunc && injectFunc()
    const cmd = await getPublishCmdBy({ version });
    expect(cmd).toEqual(`npm publish --tag ${expectTag}`);
  });
});