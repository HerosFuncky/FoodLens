import sys
from azure.ai.ml import MLClient
from azure.ai.ml.entities import Model
from azure.ai.ml.constants import AssetTypes
from azure.identity import InteractiveBrowserCredential

credential = InteractiveBrowserCredential()

ml_client = MLClient(
    credential=credential,
    subscription_id="6a69f0fe-0925-4755-a39f-c9eea93e4364",
    resource_group_name="foodlens-rg",
    workspace_name="foodlens-ml"
)

# Job d'entraînement dont on enregistre la sortie.
# Par défaut le dernier retrain ; on peut en passer un autre en argument :
#   python register_model.py <nom_du_job>
JOB_NAME = sys.argv[1] if len(sys.argv) > 1 else "salmon_bear_qnsyc2d2r9"

job = ml_client.jobs.get(JOB_NAME)
if job.status != "Completed":
    print(f"Job '{JOB_NAME}' en statut '{job.status}'. "
          f"Attends qu'il soit 'Completed' avant d'enregistrer le modèle.")
    sys.exit(1)

# Enregistre une NOUVELLE version (auto-incrémentée) à partir de la sortie du job.
# (Avant : on faisait un get v1 -> registration sautée + chemin codé en dur sur l'ancien job.)
model = ml_client.models.create_or_update(
    Model(
        path=f"azureml://jobs/{JOB_NAME}/outputs/model",
        name="foodlens-classifier",
        description="Food101 - 20 classes (échantillonnage stratifié, retrain)",
        type=AssetTypes.CUSTOM_MODEL,
    )
)
print(f"Modèle enregistré : {model.name} v{model.version}")
print("Étape suivante : python deploy_model.py")
