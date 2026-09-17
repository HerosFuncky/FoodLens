# FoodLens

Nutrition analysis from a photo. Upload a picture of a dish and the app returns the food it recognised, its macros (calories, protein, carbs, fat), a warning if one of your declared allergens is likely in it, and a short piece of advice.

Azure project built for the SCIA track at EPITA.

## How it works

The backend runs four steps on every image:

1. Azure Computer Vision returns a list of tags (banana, plate, dessert...). Tags above 0.5 confidence are kept and a first label is picked from them using a priority list (`FOOD_TAGS_PRIORITY` in `backend/main.py`).
2. A ResNet18 fine-tuned on 20 Food-101 classes, deployed on an Azure ML endpoint, proposes its own label. It is only kept if it is confident (>= 0.6) and consistent with the CV tags, or very confident (>= 0.8) on its own. Otherwise the CV label stays.
3. A local LLM through LM Studio (Qwen3 8B by default) gets the label, the tags and the user's allergens. It answers with a JSON containing the identified food in French, a USDA search term in English, a `safe` boolean, an alert and a tip.
4. Macros come from a static table for the 20 model classes (`nutrition_static.py`), otherwise from the USDA FoodData Central API with a few filters to drop odd results (dehydrated products, juices, inconsistent energy values).

The React frontend shows the result, keeps the last six meals in memory and computes the calories left against a 1750 kcal daily target.

## Layout

```
backend/            FastAPI app
  main.py           /analyze route and the CV + ML + LLM + USDA merge logic
  services/         Azure CV, Azure ML, local model, LM Studio and static table clients
frontend/           React + Vite, served by nginx in Docker
src/                train.py (training) and score.py (Azure ML scoring script)
submit_job.py       creates the cluster if needed and launches training on Azure ML
register_model.py   registers a job output as a new model version
deploy_model.py     deploys the latest version to the foodlens-ep4 endpoint
get_logs.py         fetches the deployment logs
predict_local.py    downloads the model and tests an image locally
conda.yml           inference environment for the endpoint
deployment.yml      same config as deploy_model.py, for the az ml CLI
presentation/       project slides (pptxgenjs + typst)
```

## Running locally

You need a `backend/.env` file with:

```
AZURE_CV_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com/
AZURE_CV_KEY=...
AZURE_ML_ENDPOINT=https://foodlens-ep4.<region>.inference.ml.azure.com/score
AZURE_ML_KEY=...
USDA_API_KEY=...
```

Then with Docker:

```
docker compose up --build
```

The backend listens on http://127.0.0.1:8000 and the frontend on http://127.0.0.1:5173. LM Studio has to run on the host machine, port 1234, with a model loaded. Without it the app still works but returns "Conseil non disponible" and no allergen alert.

Without Docker:

```
cd backend && pip install -r requirements.txt && python main.py
cd frontend && npm install && npm run dev
```

### Optional variables

| Variable | Effect |
|---|---|
| `LM_STUDIO_URL` | LM Studio URL, defaults to `http://127.0.0.1:1234` |
| `LM_STUDIO_MODEL` | model name, defaults to `qwen/qwen3-8b` |
| `USE_LOCAL_MODEL=1` | use `local_model/model.pt` instead of the Azure ML endpoint (needs torch and torchvision in the backend) |
| `MODEL_LOCAL_DIR` | folder to look for `model.pt` in |
| `USE_OFFLINE_CV=true` | point to the local Computer Vision container from the `offline` docker compose profile |

For offline CV: `docker compose --profile offline up`. The container still needs `AZURE_CV_KEY` for billing.

## Model

The model is an ImageNet-pretrained ResNet18 with the last layer replaced for 20 classes. Training uses the first 20 Food-101 classes with 300 images each, 8 epochs, Adam at 5e-4, and random crop, horizontal flip and color jitter as augmentation. `train.py` downloads Food-101 on its own.

The full cycle on Azure:

```
python submit_job.py                 # launches training, prints the job name
python register_model.py <job_name>  # once the job is Completed
python deploy_model.py               # deploys the latest version, routes 100% of traffic to it
python get_logs.py                   # when the deployment complains
```

All these scripts authenticate through the browser (`InteractiveBrowserCredential`). The compute cluster scales to zero, so it only eats quota while a job runs. It sometimes gets deleted by hand to free cores, `submit_job.py` recreates it in that case.

To test the model without going through the endpoint:

```
python predict_local.py _test.jpg      # latest registered version
python predict_local.py _test.jpg 4    # specific version
```

The first run downloads the weights into `local_model/` (git-ignored).

## Known limits

- Only 20 classes, all in the first alphabetical half of Food-101 (apple_pie to chicken_quesadilla). On any other dish the model has to output a wrong class, hence the guard against the CV tags.
- The frontend calls `http://localhost:8000` hardcoded.
- CORS is wide open, it is a demo project.
- Azure subscription and workspace IDs sit in the root scripts.
