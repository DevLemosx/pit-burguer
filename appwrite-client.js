(() => {
  const config = window.PIT_APPWRITE_CONFIG || {};
  const sdk = window.Appwrite;
  const configured = Boolean(
    sdk && config.endpoint && config.projectId && config.databaseId && config.tableId
  );

  window.pitAppwriteConfigured = configured;
  window.pitAppwriteAdminConfigured = Boolean(configured && config.bucketId && config.adminUserId);

  if (!configured) {
    window.pitAppwriteClient = null;
    window.pitAppwriteAccount = null;
    window.pitAppwriteTables = null;
    window.pitAppwriteStorage = null;
    window.pitAppwriteSdk = sdk || null;
    return;
  }

  const client = new sdk.Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

  window.pitAppwriteClient = client;
  window.pitAppwriteAccount = new sdk.Account(client);
  window.pitAppwriteTables = new sdk.TablesDB(client);
  window.pitAppwriteStorage = new sdk.Storage(client);
  window.pitAppwriteSdk = sdk;

  window.loadPitMenuFromAppwrite = async () => {
    try {
      const row = await window.pitAppwriteTables.getRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: "main"
      });
      const menuConfig = JSON.parse(row.config_json);
      window.applyPitMenuConfig(menuConfig);
      return true;
    } catch (error) {
      if (Number(error?.code) !== 404) {
        console.warn("Não foi possível atualizar o cardápio pelo Appwrite. Usando os dados locais.", error);
      }
      return false;
    }
  };
})();
