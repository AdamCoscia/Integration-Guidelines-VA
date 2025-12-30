# Preliminary Guidelines For Combining Data Integration and Visual Data Analysis

[![license](https://img.shields.io/badge/License-MIT-A54046)](https://github.com/AdamCoscia/Integration-Guidelines-VA/blob/main/LICENSE)
[![arxiv badge](https://img.shields.io/badge/arXiv-2403.04757-red)](https://arxiv.org/abs/2403.04757)
[![DOI:10.1109/TVCG.2023.3334513](https://img.shields.io/badge/DOI-10.1109/TVCG.2023.3334513-blue)](https://doi.org/10.1109/TVCG.2023.3334513)

An empirical study investigating whether and how data integration should be incorporated directly into the visual analytics process.

📚➕📊🟰💯🤯😎

This code and data accompany the research paper:

**[Preliminary Guidelines For Combining Data Integration and Visual Data Analysis][paper]**  
<span style="opacity: 70%">Adam Coscia, Ashley Suh, Remco Chang, Alex Endert</span>  
_IEEE Transactions on Visualization and Computer Graphics (TVCG), 2024_  
| [📖 Paper][paper] | [🎞️ Video][video] | [📚 Data][data] |

## What did we study?

The rapid growth of data today requires methods to combine information from disparate sources into a unified data representation to facilitate analytical reasoning.
Yet visual analytics tools such as Tableau present manual data preparation solutions that occur as a separate step from visual analytics operations such as encode and filter.

**Our aim is to contribute preliminary guidelines for incorporating data integration into an active visual analytics process, towards fostering better information retrieval that allows people to incorporate their data seamlessly and improve how visualizations are created and used.**

We raised **two open research questions** based on the common approach of separating data integration and visual analytics processes in research and design:

1. "Where and how should data integration operations, such as joins, be supported in tandem with visual analytics operations, such as encode and filter?"
2. "How will incorporating data integration into an on-going visual analytics process affect user behaviors?"

To answer these questions, we developed **two interface alternatives** featuring contrasting approaches to the data preparation and analysis workflow: 

- **Manual file-based ex-situ integration** as a separate step from visual analytics operations
- **Automatic UI-based in-situ integration** merged with visual analytics operations

With these interfaces, study participants were asked to complete **specific and free-form tasks** with each interface, browsing for patterns, generating insights, and summarizing relationships between attributes distributed across multiple files.

## What did we learn?

### 🔍 Findings

Analyzing participants' interactions with our interfaces and think aloud feedback, we found:

1. Participants exhibited **unique in-situ integration strategies**. For example, several participants exclusively integrated data on the fly on purpose, spending little to no time integrating data beforehand.
2. Yet surprisingly, we found that **interface and task type did not significantly affect** overall task completion time or the total number of interactions.
3. At the same time, in-situ integration operations sometimes negatively affected the ability for participants to **generate and track hypotheses and insights**; specifically, participants' analytical behaviors underscored issues of **satisficing and exhibiting biased behaviors**.

### ✅ Guidelines

With our findings, we synthesized **preliminary guidelines** for incorporating data integration into visual data analysis:

1. **Show where and how data are being integrated.** Visual analytics interfaces should clarify the limitations of how and what data are integrated, e.g., by using a pop-up window to display how a join will be performed before it is ultimately integrated into the data set. Analysis outcomes that follow from "anonymous" integration could be dangerous if not carefully evaluated.
2. **Use in-situ integration for exploring the space of attributes.** The overhead cost of data integration outside the interface could prevent users from finding relevant attributes. Using in-situ data integration for quickly encoding new attributes in the visualization could help users maintain their focus on performing visual data analysis.
3. **Balance manual and automated approaches.** Manual data integration can help analysts remember relevant attributes and learn more about their data, while automated data integration can alleviate time pressures and keep analysts in the sensemaking loop longer. Designers should consider a minimal but fluid design for in-situ integration only when time spent and interactions should be minimized, helping users reduce the number of concurrent processes to manage while helping them maintain context.

## What is included in this repo?

🗂️ This repo includes all study materials, including:

### `analysis/`

All of the study participant log data, Excel workbooks, and Jupyter notebooks used for the analysis in the study.

### `data/`

The data sets used in the interface for our study.

### `interface/`

The code for the interfaces used for the study.
Additional details can be found in [interface/README.md](interface/README.md)

## Credits

Led by <a href='https://adamcoscia.com/' target='_blank'>Adam Coscia</a>, our study is a result of a collaboration between visualization experts in human centered computing and interaction design from
<img src="https://adamcoscia.com/assets/icons/other/tufts-logo.png" alt="Tufts Logo" height="21" style="vertical-align: bottom;"/>
Tufts
and
<img src="https://adamcoscia.com/assets/icons/other/gt-logo.png" alt="Interlocking GT" height="21" style="vertical-align: bottom;"/>
Georgia Tech.

This study was conducted by
<a href='https://adamcoscia.com/' target='_blank'>Adam Coscia</a>,
Ashely Suh,
Remco Chang
and
Alex Endert.

## Citation

To learn more about our study, please read our [research paper][paper] (published in [IEEE TVCG](https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=2945)).

```bibtex
@article{Coscia:2024:Guidelines,
  author={Coscia, Adam and Suh, Ashley and Chang, Remco and Endert, Alex},
  journal={IEEE Transactions on Visualization and Computer Graphics}, 
  title={Preliminary Guidelines for Combining Data Integration and Visual Data Analysis}, 
  year={2024},
  volume={30},
  number={10},
  pages={6678-6690},
  doi={10.1109/TVCG.2023.3334513}
}
```

## License

The software is available under the [MIT License](https://github.com/AdamCoscia/Integration-Guidelines-VA/blob/main/LICENSE).

## Contact

If you have any questions, feel free to [open an issue](https://github.com/AdamCoscia/Integration-Guidelines-VA/issues) or contact [Adam Coscia](https://adamcoscia.com).

[paper]: https://arxiv.org/abs/2403.04757
[video]: https://youtu.be/NzVxHn-OpqQ
[data]: https://github.com/AdamCoscia/Integration-Guidelines-VA
