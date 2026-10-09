# PHASE 2 — DATA SOURCE INVENTORY
> **Version:** 1.0
> **Purpose:** Catalogue all potential data sources for AGROBUS Phase 2 soil property AI.
> **Rule:** No field is marked "Yes" unless verified from the actual source documentation.

---

## How To Read This Inventory

| Column         | Meaning                                                                    |
|----------------|----------------------------------------------------------------------------|
| Images         | Does the source contain actual soil photographs or spectral images?        |
| Lab Measurements | Does it contain wet chemistry or measured soil properties?               |
| Image Pairing  | Is each image directly linked to a specific sample's lab measurements?     |
| Intended Use   | How this source can be used in the AGROBUS pipeline                        |

---

## Source 1 — Kaggle Soil Image Dataset (Current Phase 1 Dataset)

| Field            | Detail                                                                 |
|------------------|------------------------------------------------------------------------|
| **Dataset**      | Soil Image Dataset                                                     |
| **Source**       | Kaggle (jayaprakashpondy)                                              |
| **URL**          | https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset    |
| **Countries**    | India (primarily)                                                      |
| **Rwanda Samples** | None identified                                                      |
| **Images**       | Yes — RGB photographs                                                  |
| **Lab Measurements** | No                                                                 |
| **pH**           | No                                                                     |
| **N**            | No                                                                     |
| **P**            | No                                                                     |
| **K**            | No                                                                     |
| **Organic Matter** | No                                                                   |
| **Moisture**     | No                                                                     |
| **Texture**      | No (visual class only)                                                 |
| **Coordinates**  | No                                                                     |
| **Sample IDs**   | No                                                                     |
| **Image Pairing**| No — images are not paired to any lab measurements                     |
| **Units**        | Not applicable                                                         |
| **Lab Method**   | Not applicable                                                         |
| **License**      | CDLA-Permissive-1.0 (verified)                                         |
| **Intended Use** | Phase 1 visual soil type classification ONLY                           |
| **Limitations**  | Cannot support pH/NPK/OM/moisture prediction. No Rwanda relevance.     |

---

## Source 2 — AfSIS (Africa Soil Information Service) Soil Chemistry Dataset

| Field            | Detail                                                                 |
|------------------|------------------------------------------------------------------------|
| **Dataset**      | AfSIS Soil Chemistry (Phase I)                                         |
| **Source**       | Africa Soil Information Service / ICRAF / AWS Open Data               |
| **URL**          | https://registry.opendata.aws/afsis/                                   |
| **Countries**    | Multiple African countries (sub-Saharan Africa)                        |
| **Rwanda Samples** | Possible — requires query of country field to confirm                |
| **Images**       | No — contains MIR/NIR spectral data, NOT RGB photographs              |
| **Lab Measurements** | Yes — wet chemistry reference measurements                         |
| **pH**           | Yes                                                                    |
| **N**            | Yes                                                                    |
| **P**            | Yes                                                                    |
| **K**            | Yes                                                                    |
| **Organic Matter** | Yes (Organic Carbon)                                                 |
| **Moisture**     | Partial                                                                |
| **Texture**      | Yes (clay, silt, sand)                                                 |
| **Coordinates**  | Yes (GPS)                                                              |
| **Sample IDs**   | Yes                                                                    |
| **Image Pairing**| No — spectral data is NOT RGB smartphone images                        |
| **Units**        | Documented                                                             |
| **Lab Method**   | Documented (wet chemistry)                                             |
| **License**      | ODC Open Database License (ODbL) v1.0 — verified                      |
| **Intended Use** | Reference / Context / Pre-training feature extraction (with caution)  |
| **Limitations**  | Spectral (MIR) data cannot be directly used to train an RGB image model. Rwanda coverage requires verification. Cannot be directly paired with smartphone photos.|

> **IMPORTANT:** AfSIS spectral data is scientifically valuable but is NOT a substitute for
> RGB image-to-lab-measurement pairing. Do not attempt to use AfSIS to train an image model.

---

## Source 3 — iSDAsoil (Innovative Solutions for Decision Agriculture)

| Field            | Detail                                                                 |
|------------------|------------------------------------------------------------------------|
| **Dataset**      | iSDAsoil — Africa-wide 30m resolution soil property maps               |
| **Source**       | Innovative Solutions for Decision Agriculture (iSDA)                  |
| **URL**          | https://www.isda-africa.com/isdasoil/ / https://registry.opendata.aws/isdasoil/ |
| **Countries**    | All of Africa at 30m resolution                                        |
| **Rwanda Samples** | Yes — full spatial coverage of Rwanda                               |
| **Images**       | No — this is a predicted raster map, not a photograph dataset          |
| **Lab Measurements** | No — values are model PREDICTIONS, not direct measurements        |
| **pH**           | Yes (predicted)                                                        |
| **N**            | Yes (Total Nitrogen, predicted)                                        |
| **P**            | Yes (Extractable Phosphorus, predicted)                                |
| **K**            | Yes (predicted)                                                        |
| **Organic Matter** | Yes (Organic Carbon, predicted)                                      |
| **Moisture**     | No                                                                     |
| **Texture**      | Yes (clay, silt, sand — predicted)                                     |
| **Coordinates**  | Yes (raster grid)                                                      |
| **Sample IDs**   | Not applicable (raster format)                                         |
| **Image Pairing**| No                                                                     |
| **Units**        | Documented                                                             |
| **Lab Method**   | Machine learning predictions from training data, not direct measurement|
| **License**      | CC-BY 4.0 (verified)                                                   |
| **Intended Use** | Spatial context / location-aware feature augmentation for model B or C |
| **Limitations**  | Values are ML predictions, NOT laboratory ground truth. Must NOT be used as ground truth for training a new soil property model. May be used as spatial covariate/context feature where scientifically justified.|

> **CRITICAL RULE:** iSDAsoil values are model predictions. Using them as training labels for
> another model creates circular reasoning. They may only be used as spatial context features,
> not as ground truth.

---

## Source 4 — RwaSIS (Rwanda Soil Information Service)

| Field            | Detail                                                                 |
|------------------|------------------------------------------------------------------------|
| **Dataset**      | Rwanda Soil Information Service                                        |
| **Source**       | Rwanda Agriculture and Animal Resources Development Board (RAB)        |
| **URL**          | https://rwasis.rab.gov.rw                                              |
| **Countries**    | Rwanda                                                                 |
| **Rwanda Samples** | Yes — national soil survey data (1,830+ profile points reported)    |
| **Images**       | Not publicly available — no downloadable RGB soil image dataset        |
| **Lab Measurements** | Yes — soil chemistry and texture included in profile dataset        |
| **pH**           | Yes (in profile data)                                                  |
| **N**            | Possibly — requires direct request to RAB                             |
| **P**            | Possibly — requires direct request to RAB                             |
| **K**            | Possibly — requires direct request to RAB                             |
| **Organic Matter** | Possibly — requires direct request to RAB                           |
| **Moisture**     | Not confirmed                                                          |
| **Texture**      | Yes                                                                    |
| **Coordinates**  | Yes (GPS)                                                              |
| **Sample IDs**   | Yes (within the dataset)                                               |
| **Image Pairing**| No — no publicly available RGB image-to-measurement pairs             |
| **Units**        | Documented within the system                                           |
| **Lab Method**   | Partially documented — requires RAB contact to confirm per-property    |
| **License**      | Not publicly documented — requires direct data-sharing agreement       |
| **Intended Use** | Rwanda-specific spatial context / future collaboration source          |
| **Limitations**  | No public RGB image download. Must contact RAB directly for research data access. License and sharing terms must be confirmed before use in a model.|

> **Recommended Action:** Contact RAB (Rwanda Agriculture Board) and request a Research Data
> Sharing Agreement. This is the single most valuable potential Rwanda-specific source.

---

## Source 5 — Soils4Africa

| Field            | Detail                                                                 |
|------------------|------------------------------------------------------------------------|
| **Dataset**      | Soils4Africa Continental Soil Information System                       |
| **Source**       | Soils4Africa (H2020 EU-funded project) / ISRIC                        |
| **URL**          | https://africasis.isric.org / https://www.soils4africa-h2020.eu/      |
| **Countries**    | 33 African countries                                                   |
| **Rwanda Samples** | Possible — requires query of country field to confirm               |
| **Images**       | No — field observation data; spectral analysis only                   |
| **Lab Measurements** | Yes — harmonized standard laboratory analysis                      |
| **pH**           | Yes                                                                    |
| **N**            | Yes                                                                    |
| **P**            | Yes                                                                    |
| **K**            | Yes                                                                    |
| **Organic Matter** | Yes                                                                  |
| **Moisture**     | Partial                                                                |
| **Texture**      | Yes                                                                    |
| **Coordinates**  | Yes                                                                    |
| **Sample IDs**   | Yes                                                                    |
| **Image Pairing**| No                                                                     |
| **Units**        | Harmonized and documented                                              |
| **Lab Method**   | Harmonized and documented                                              |
| **License**      | Open access — license details to be confirmed on download              |
| **Intended Use** | Reference / Africa-wide context / potential pre-training support       |
| **Limitations**  | No RGB image pairing. Rwanda coverage requires verification. Quality control ongoing per project documentation.|

---

## Source 6 — ISRIC WoSIS (World Soil Information Service)

| Field            | Detail                                                                 |
|------------------|------------------------------------------------------------------------|
| **Dataset**      | WoSIS — World Soil Information Service                                 |
| **Source**       | ISRIC — World Soil Information                                         |
| **URL**          | https://isric.org / WFS: http://data.isric.org/geoserver/wosis_latest/wfs |
| **Countries**    | Global                                                                 |
| **Rwanda Samples** | Yes — Rwanda profile points exist in the global database            |
| **Images**       | No — tabular soil profile data only                                   |
| **Lab Measurements** | Yes — standardized physical and chemical properties               |
| **pH**           | Yes                                                                    |
| **N**            | Yes                                                                    |
| **P**            | Yes                                                                    |
| **K**            | Yes                                                                    |
| **Organic Matter** | Yes (Organic Carbon)                                                 |
| **Moisture**     | Limited                                                                |
| **Texture**      | Yes                                                                    |
| **Coordinates**  | Yes                                                                    |
| **Sample IDs**   | Yes                                                                    |
| **Image Pairing**| No                                                                     |
| **Units**        | Documented and standardized                                            |
| **Lab Method**   | Documented per profile                                                 |
| **License**      | CC-BY 4.0 (verify current version)                                     |
| **Intended Use** | Rwanda spatial reference / context layer / validation comparison       |
| **Limitations**  | No RGB image pairing. Sample count for Rwanda may be small. Historical data may reflect older land conditions.|

---

## Summary Assessment Matrix

| Source              | Rwanda Data | Lab Values | RGB Images | Image Pairing | Usable For Training Image Model? |
|---------------------|-------------|------------|------------|---------------|----------------------------------|
| Kaggle Soil Dataset | No          | No         | Yes        | No            | Phase 1 visual classification only |
| AfSIS               | Possible    | Yes (spectral) | No     | No            | No (spectral, not RGB)           |
| iSDAsoil            | Yes (maps)  | Predicted  | No         | No            | No — predictions, not ground truth |
| RwaSIS              | Yes         | Yes        | Not public | No            | Requires RAB agreement — potential future use |
| Soils4Africa        | Possible    | Yes        | No         | No            | No (no image pairing)            |
| ISRIC WoSIS         | Yes (limited)| Yes       | No         | No            | No (no image pairing)            |
| **AGROBUS Field Collection** | Pending | Pending | Pending | Pending   | **TARGET — Phase 2.3 onwards**   |

---

## Critical Finding

> **No existing public dataset provides the combination of:**
> - RGB soil photographs
> - Paired laboratory measurements
> - Rwanda geographic coverage
>
> **Conclusion:**
> The AGROBUS Photo-to-Soil-Property model CANNOT be trained without original field data
> collection as described in Phase 2.2.
>
> Existing datasets (iSDAsoil, RwaSIS, WoSIS) can be used ONLY as:
> - Spatial context features (location-aware model enrichment)
> - Reference for interpretation engines
> - Comparison baseline for Rwanda-specific model outputs
>
> They must NOT be used as image model training labels.

---

## Recommended Immediate Actions

1. **Contact RAB** (Rwanda Agriculture Board) to request a Research Data Sharing Agreement for
   RwaSIS soil profile data with GPS coordinates.
2. **Query AfSIS and Soils4Africa** for confirmed Rwanda sample counts and coordinate data.
3. **Register for iSDAsoil API access** (free) for location-aware context feature extraction.
4. **Begin AGROBUS field data collection** following the Phase 2.2 protocol.
