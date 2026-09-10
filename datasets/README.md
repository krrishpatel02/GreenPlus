# GreenPlus Datasets

This folder is the source-data catalog for model training and evaluation. Runtime model files remain under `ai/` and are loaded only by prediction requests.

## Available Sources

| Dataset | Purpose | Model | Location |
|---|---|---|---|
| Carbon household data | Monthly household carbon emissions | Carbon v3 | `ai/carbon/carbon.csv` |
| Energy appliance data | Appliance energy consumption and sensor features | Energy v2 | `ai/energy/energy.csv` |

## Data Rules

- Keep raw datasets separate from generated predictions and model binaries.
- Do not commit personal information, passwords, or MongoDB exports.
- Record new feature columns and target columns in the relevant training script before retraining.
- Store generated comparisons and predictions beside the model version that produced them.
