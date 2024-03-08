# Analysis

Description of files and folders in `analysis/` directory.

- To see our analysis, please open the files in `jupyter_notebooks_HTML/` and `excel_workbooks/`.

- To see the raw figures we generated, please open `figures/`.

- To see the raw interaction logs and survey data, please open `data`.

We include a full breakdown of each file and folder below.

## Files

These files include analysis of participants':

- interactions (`interactions.ipynb`)

- post-study survey responses (`surveys.ipbynb`)

- time spent on tasks (`timing.ipynb`)

## Folders

### data/

This folder includes:

- the raw mouse event logs and final tables for each participant (`participants/`)

- the survey responses, both pre-study and post-study, with PII removed (`surveys/`)

- the manual timing of intervals of data integration (`integration_timings_raw.xlsx`)

- the study condition that each participant followed (`meta_data.xlsx`)

### excel_workbooks/

This folder includes analysis of:

- integration timings (`integration_timings.xlsx`)

- interactions (`interactions.xlsx`)

- time spent on each task (`task_performance_timings.xlsx`)

- survey responses, both pre-study and post-study (`pre-study_survey.xlsx`, `post-study_survey.xlsx`)

### figures/

This folder includes the raw figures produced for the paper by the jupyter notebooks and excel workbooks, including:

- results on interactions (`interactions/`), surveys (`surveys/`), timelines (`timelines/`), and timing (`timing/`)

### /jupyter_notebooks_HTML

This folder contains HTML versions of the Jupyter Notebooks in the root of this folder (`interactions.ipynb`, `surveys.ipynb`, `timing.ipynb`).

We included these for easier browsing of the analysis we did using the notebooks.
