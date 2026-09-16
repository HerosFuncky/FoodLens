from azure.ai.ml import MLClient
from azure.identity import InteractiveBrowserCredential

ml_client = MLClient(
    credential=InteractiveBrowserCredential(),
    subscription_id="6a69f0fe-0925-4755-a39f-c9eea93e4364",
    resource_group_name="foodlens-rg",
    workspace_name="foodlens-ml",
)

logs = ml_client.online_deployments.get_logs(
    name="foodlens-deploy",
    endpoint_name="foodlens-ep4",
    lines=200,
)
print(logs)
