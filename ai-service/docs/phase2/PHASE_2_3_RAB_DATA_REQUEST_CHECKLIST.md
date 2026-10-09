# PHASE 2.3 — RAB / RwaSIS DATA REQUEST CHECKLIST
> **Status:** REQUEST NOT YET SUBMITTED
> **Target organization:** Rwanda Agriculture and Animal Resources Development Board (RAB)
> **Platform:** RwaSIS — Rwanda Soil Information Service
> **Contact portal:** https://rwasis.rab.gov.rw

---

## Purpose
This checklist describes the exact information AGROBUS should REQUEST from RAB/RwaSIS.
Nothing in this document implies that RAB has agreed to provide any data.
All items are REQUEST items only.

---

## 1. Request Context

Draft communication purpose:

> AGROBUS is developing an AI-assisted soil analysis tool for Rwandan smallholder farmers.
> We are requesting access to Rwanda soil profile data for non-commercial research
> and prototype development. All data usage will adhere to the agreed license terms.

---

## 2. Data Fields to Request

### Absolutely Required (request these first)

| # | Field                   | Reason                                                    |
|---|-------------------------|-----------------------------------------------------------|
| 1 | Sample ID               | Essential for linking all records                         |
| 2 | District                | Rwanda location for geographic model                      |
| 3 | Sector                  | Sub-district resolution                                   |
| 4 | GPS Coordinates         | Latitude and longitude for location-aware AI              |
| 5 | Collection Date         | Seasonal and temporal context                             |
| 6 | Soil Depth              | Topsoil vs subsoil distinction                            |
| 7 | pH                      | Primary required soil property                            |
| 8 | Organic Matter (%)      | Key fertility indicator                                   |
| 9 | Laboratory Name         | Chain of custody                                          |
| 10| Analytical Method       | Per property — required for scientific validity           |
| 11| Measurement Units       | Per property — essential for model standardization        |
| 12| Laboratory Report Ref   | Traceability                                              |

### Strongly Recommended (request these)

| # | Field                   | Reason                                                    |
|---|-------------------------|-----------------------------------------------------------|
| 13| Phosphorus (ppm)        | Key nutrient for crop recommendation                      |
| 14| Potassium (ppm)         | Key nutrient for crop recommendation                      |
| 15| Soil Texture (clay/silt/sand) | Affects drainage and fertilizer uptake             |
| 16| Elevation (m)           | Climate and erosion context                               |
| 17| Season of Collection    | Rwanda Season A / B / C                                   |
| 18| Crop Type               | Current or previous crop on plot                          |

### Optional (request if available)

| # | Field                   | Reason                                                    |
|---|-------------------------|-----------------------------------------------------------|
| 19| Nitrogen (%)            | Volatile measurement — useful if available                |
| 20| Moisture (%)            | Field condition context                                   |
| 21| Detection Limits        | Laboratory quality control                                |
| 22| Analyst Reference       | Lab QC traceability                                       |

---

## 3. Image Availability — Critical Question

Request the following specific information from RAB:

- [ ] Do any RwaSIS soil profiles have associated RGB soil photographs?
- [ ] If yes, are photographs available for download or sharing?
- [ ] If not, can AGROBUS researchers photograph existing preserved samples?
- [ ] If new collection is required, can RAB indicate priority sampling locations?

> **NOTE:** If no RGB images are associated with RwaSIS profiles, the data can still
> be used for spatial context and location-aware feature enrichment, but CANNOT be
> used to train the image-to-soil-property model directly.

---

## 4. License and Data-Use Questions

Request explicit answers to:

- [ ] What license governs the shared data?
- [ ] Is commercial use permitted? (AGROBUS is a commercial platform)
- [ ] Is use in an AI/ML model permitted?
- [ ] Is the data publishable in academic papers or reports?
- [ ] What attribution is required?
- [ ] What restrictions apply to derived models?
- [ ] Can AGROBUS share a derived model trained on this data?
- [ ] Is a formal Data Sharing Agreement (DSA) required?

---

## 5. Submission Checklist

Before sending the request to RAB:

- [ ] Draft official request letter on institutional letterhead (if applicable)
- [ ] Include AGROBUS project description and purpose
- [ ] Include list of requested fields (Section 2 above)
- [ ] Include intended use statement (non-commercial research prototype)
- [ ] Include data security and access control statement
- [ ] Include contact details
- [ ] Submit through official RAB channel or email
- [ ] Record submission date
- [ ] Record RAB reference number when received
- [ ] Follow up if no response within 10 business days

---

## 6. Current Status

| Item                         | Status                  |
|------------------------------|-------------------------|
| RAB contact identified       | Pending                 |
| Request letter drafted       | Pending                 |
| Request submitted            | NOT SUBMITTED           |
| RAB acknowledgment received  | NOT RECEIVED            |
| Data sharing agreement signed| NOT SIGNED              |
| Data received                | NOT RECEIVED            |
