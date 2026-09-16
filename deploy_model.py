from azure.ai.ml import MLClient
from azure.ai.ml.entities import ManagedOnlineDeployment, Environment, CodeConfiguration
from azure.identity import InteractiveBrowserCredential

credential = InteractiveBrowserCredential()

ml_client = MLClient(
    credential=credential,
    subscription_id="6a69f0fe-0925-4755-a39f-c9eea93e4364",
    resource_group_name="foodlens-rg",
    workspace_name="foodlens-ml"
)

ENDPOINT = "foodlens-ep4"

# Déploie la DERNIÈRE version enregistrée du modèle (le v2 fraîchement entraîné).
versions = [int(m.version) for m in ml_client.models.list(name="foodlens-classifier")]
latest = max(versions)
print(f"Déploiement de foodlens-classifier v{latest} sur {ENDPOINT}...")

# Même config que deployment.yml : score.py + conda, sur l'endpoint réel ep4.
deployment = ManagedOnlineDeployment(
    name="foodlens-deploy",
    endpoint_name=ENDPOINT,
    model=f"azureml:foodlens-classifier:{latest}",
    environment=Environment(
        image="mcr.microsoft.com/azureml/openmpi4.1.0-ubuntu20.04",
        conda_file="./conda.yml",
    ),
    code_configuration=CodeConfiguration(code="./src", scoring_script="score.py"),
    instance_type="Standard_DS2_v2",  # 2 cores
    instance_count=1,
)
ml_client.online_deployments.begin_create_or_update(deployment).result()
print("Déploiement terminé")

# Envoie 100% du trafic vers ce déploiement
endpoint = ml_client.online_endpoints.get(ENDPOINT)
endpoint.traffic = {"foodlens-deploy": 100}
ml_client.online_endpoints.begin_create_or_update(endpoint).result()
print("100% du trafic -> foodlens-deploy")
