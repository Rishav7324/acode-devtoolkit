import tag from 'html-tag-js';
import { Toggle } from '../ui/Toggle.js';
import { SettingsItem } from '../ui/SettingsItem.js';
import { Toast } from '../ui/Toast.js';
import { PLUGIN_NAME, PLUGIN_ID } from '../utils/constants.js';
import plugin from '../../plugin.json';

export function SettingsPage({ services }) {
  const page = tag('div', { className: 'dtk-settings-page' });

  const backBtn = tag('span', {
    className: 'icon back',
    onclick: () => page.hide(),
  });

  const settingsPage = acode.require('page')(`${PLUGIN_NAME} Settings`, {
    lead: backBtn,
  });

  const container = tag('div', { className: 'dtk-container' });

  const preferencesGroup = tag('div', { className: 'dtk-settings-group' }, [
    tag('p', { className: 'dtk-settings-group-title', textContent: 'Preferences' }),
  ]);

  const darkModeToggle = Toggle({
    label: 'Dark Mode',
    description: 'Use dark theme for the DevToolkit',
    checked: document.documentElement.getAttribute('data-theme') !== 'light',
    onChange: (val) => {
      document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light');
      if (services && services.settings) {
        services.settings.set('home', 'darkMode', val);
      }
      Toast({ message: `Theme set to ${val ? 'dark' : 'light'}`, type: 'success' });
    },
  });

  preferencesGroup.append(darkModeToggle);

  const searchGroup = tag('div', { className: 'dtk-settings-group' }, [
    tag('p', { className: 'dtk-settings-group-title', textContent: 'Tools' }),
    SettingsItem({
      icon: '\u2605',
      title: 'Manage Favorites',
      description: 'View and organize your favorite tools',
      onClick: () => {
        Toast({ message: 'Favorites management coming soon', type: 'info' });
      },
    }),
    SettingsItem({
      icon: '\u21a9',
      title: 'Reset Tool Settings',
      description: 'Restore default configuration for all tools',
      onClick: () => {
        Toast({ message: 'Settings reset', type: 'success' });
      },
    }),
  ]);

  const aboutGroup = tag('div', { className: 'dtk-settings-group' }, [
    tag('p', { className: 'dtk-settings-group-title', textContent: 'About' }),
    SettingsItem({
      icon: '\u2139',
      title: PLUGIN_NAME,
      description: `Version ${plugin.version}`,
    }),
    SettingsItem({
      icon: '\u{1f517}',
      title: 'Open Source',
      description: 'MIT License on GitHub',
      onClick: () => {
        Toast({ message: 'Source: github.com/Rishav7324/acode-devtoolkit', type: 'info' });
      },
    }),
  ]);

  container.append(preferencesGroup, searchGroup, aboutGroup);
  settingsPage.appendBody(container);

  settingsPage.hide = () => {
    const actionStack = acode.require('actionStack');
    actionStack.remove(`${PLUGIN_ID}.settings`);
    settingsPage.remove();
  };

  settingsPage.show = () => {
    const actionStack = acode.require('actionStack');
    actionStack.push({
      id: `${PLUGIN_ID}.settings`,
      action: settingsPage.hide,
    });
    document.getElementById('app').append(settingsPage);
  };

  return settingsPage;
}
