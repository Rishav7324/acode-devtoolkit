const PLUGIN_ID = "com.rishav.devtoolkit";

let commands;

function init(baseUrl, $page, cache) {
  commands = acode.require("commands");

  commands.addCommand({
    name: "devtoolkit.open",
    description: "Open Acode DevToolkit",
    exec: () => {
      $page.innerHTML = `
        <div style="padding:16px;">
          <h2>🚀 Acode DevToolkit</h2>
          <p>Welcome to the first version of Acode DevToolkit.</p>

          <hr>

          <h3>Available Modules</h3>

          <ul>
            <li>🆔 UUID Generator (Coming Soon)</li>
            <li>📄 JSON Formatter (Coming Soon)</li>
            <li>🔤 Base64 Tools (Coming Soon)</li>
          </ul>

          <p><b>Version:</b> 0.1.0</p>
        </div>
      `;

      $page.show();
    }
  });

  acode.pushNotification(
    "Acode DevToolkit",
    "Plugin loaded successfully!",
    {
      type: "success"
    }
  );
}

function unmount() {
  if (commands) {
    commands.removeCommand("devtoolkit.open");
  }
}

acode.setPluginInit(PLUGIN_ID, init);
acode.setPluginUnmount(PLUGIN_ID, unmount);