import twPlugin from 'tailwindcss/plugin.js';

type RabcCode = string[] | Record<string, string[]>;
type Type = 'data' | 'class';

interface Options {
  rabcCode: RabcCode;
  type: Type;
  mountSelector: string;
}

export const plugin = twPlugin.withOptions(function (options: Options) {
  const displays = [
    'none',
    'block',
    'inline',
    'inline-block',
    'flex',
    'inline-flex',
    'grid',
    'table',
    'table-row',
    'table-cell',
  ];

  const addHiddenClass = (utils, code, preKey = 'auth') => {
    utils[`.${preKey}-${code}`] = {
      display: 'none',
    };
  };

  const addClassUtilAct = (
    utils,
    code,
    preKey = 'auth',
    type,
    mountSelector
  ) => {
    const parentSelect =
      type === 'data'
        ? `${mountSelector}[data-${preKey}*="${code}"]`
        : `${mountSelector}.${code}`;
    utils[`${parentSelect} .${preKey}-${code}`] = {
      display: 'block',
    };
    displays.forEach((display) => {
      utils[`${parentSelect} .${preKey}-${code}.${preKey}-${display}`] = {
        display,
      };
    });
  };

  const forEachAuth = (auths, preKey, type: string, mountSelector: string) => {
    const utils = {};
    auths.forEach((code) => {
      addHiddenClass(utils, code, preKey);
    });
    auths.forEach((code) => {
      addClassUtilAct(utils, code, preKey, type, mountSelector);
    });
    return utils;
  };

  return ({ addUtilities }) => {
    const {
      rabcCode: optionCode,
      type: optionType,
      mountSelector: optionSelect,
    } = options;
    const rabcCode = optionCode ?? [];
    const type =
      optionType && ['data', 'class'].includes(optionType)
        ? optionType
        : 'data';
    const mountSelector = optionSelect ?? 'body';
    if (rabcCode) {
      if (Array.isArray(rabcCode)) {
        const utils = forEachAuth(rabcCode, 'auth', type, mountSelector);

        addUtilities(utils, { respectPrefix: true });
      } else if (rabcCode !== null && typeof rabcCode === 'object') {
        let accountUtils = {};
        Object.keys(rabcCode).forEach((role) => {
          const utils = forEachAuth(
            rabcCode[role],
            'auth',
            type,
            mountSelector
          );
          accountUtils = { ...accountUtils, ...utils };
          addHiddenClass(accountUtils, role, 'role');
          addClassUtilAct(accountUtils, role, 'role', type, mountSelector);
        });
        addUtilities(accountUtils, { respectPrefix: true });
      }
    }
  };
});

const mountClassOrData = (type, dom, code, prekey = 'auth') => {
  const dataKey = `data-${prekey}`;

  if (type === 'class' && !dom.classList.contains(code)) {
    dom.classList.add(`code`);
  } else if (type === 'data') {
    const authValue = dom.getAttribute(dataKey);
    if (!authValue || !authValue.includes(code)) {
      dom.setAttribute(dataKey, `${authValue || ''} ${code}`.trim());
    }
  }
};

export const mountRabc = (
  rabcCode: RabcCode,
  dom: HTMLDivElement,
  type: Type = 'data'
) => {
  if (dom && rabcCode) {
    if (Array.isArray(rabcCode)) {
      rabcCode.forEach((code) => {
        mountClassOrData(type, dom, code);
      });
    } else if (typeof rabcCode === 'object') {
      Object.keys(rabcCode).forEach((role) => {
        const auths = rabcCode[role];
        auths.forEach((code) => {
          mountClassOrData(type, dom, code);
        });
        mountClassOrData(type, dom, role, 'role');
      });
    }
  }
};
