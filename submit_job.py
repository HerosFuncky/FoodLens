from azure.ai.ml import MLClient, command, Input, Output
from azure.ai.ml.entities import Environment, AmlCompute
from azure.identity import InteractiveBrowserCredential

credential = InteractiveBrowserCredential()

ml_client = MLClient(
    credential=credential,
    subscription_id="6a69f0fe-0925-4755-a39f-c9eea93e4364",
    resource_group_name="foodlens-rg",
    workspace_name="foodlens-ml"
)

# Le cluster est souvent supprimé après entraînement pour libérer le quota de cores.
# On le (re)crée si besoin. min_instances=0 => 0 core consommé à l'arrêt (scale-to-zero),
# il ne consomme des cores que pendant le job puis se désalloue automatiquement.
CLUSTER_NAME = "foodlens-cluster"
try:
    ml_client.compute.get(CLUSTER_NAME)
    print(f"Cluster '{CLUSTER_NAME}' déjà présent.")
except Exception:
    print(f"Cluster '{CLUSTER_NAME}' absent -> création...")
    cluster = AmlCompute(
        name=CLUSTER_NAME,
        type="amlcompute",
        size="Standard_DS2_v2",       # 2 cores : tient dans le quota même avec l'endpoint
        min_instances=0,
        max_instances=1,
        idle_time_before_scale_down=120,
        tier="Dedicated",
    )
    ml_client.compute.begin_create_or_update(cluster).result()
    print("Cluster créé (scale-to-zero).")

job = command(
    code="./src",
    command="python train.py --epochs 8 --output_path ${{outputs.model}}",
    outputs={"model": Output(type="uri_folder")},
    environment="azureml://registries/azureml/environments/acpt-pytorch-2.2-cuda12.1/versions/8",
    compute="foodlens-cluster",
    display_name="foodlens-training"
)

returned_job = ml_client.jobs.create_or_update(job)
print(f"Job soumis : {returned_job.name}")
print(f"URL : {returned_job.studio_url}")