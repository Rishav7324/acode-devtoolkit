class DevToolkit {
  async init() {
    acode.alert(
      "Acode DevToolkit",
      "🎉 Plugin successfully loaded!\n\nWelcome to Acode DevToolkit."
    );
  }

  async destroy() {
    console.log("Acode DevToolkit unloaded");
  }
}

if (window.acode) {
  const plugin = new DevToolkit();

  acode.setPluginInit(
    "com.rishav.devtoolkit",
    async () => {
      await plugin.init();
    }
  );

  acode.setPluginUnmount(
    "com.rishav.devtoolkit",
    async () => {
      await plugin.destroy();
    }
  );
}