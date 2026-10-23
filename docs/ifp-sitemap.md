# IFP sitemap

URLs are the `<loc>` values in `ref/ifp/sitemaps/`. The template is the `<body class>` with `postid-*`, `page-id-*`, `parent-pageid-*`, and `wp-theme-*` removed. Category slug classes (`category-metascience` and the numeric `category-N`) are omitted from the shared template line and kept on the URL.

Body class for pages, posts, categories, and opportunities was read from the saved HTML in `ref/ifp/html/` or from a fetch of that URL. Author URLs and `locations.kml` were not fetched.

## Nav and footer anchors

From `#menu-main-menu` in `ref/ifp/html/home.html`:

- Research: `https://ifp.org/latest-publications/`
- All Research: `https://ifp.org/latest-publications/`
- Biotechnology: `https://ifp.org/category/biotechnology/`
- Emerging Technology: `https://ifp.org/category/emerging-technology/`
- High-Skilled Immigration: `https://ifp.org/category/high-skilled-immigration/`
- Infrastructure: `https://ifp.org/category/infrastructure/`
- Metascience: `https://ifp.org/category/metascience/`
- About: `https://ifp.org/about/`
- Team: `https://ifp.org/about/#team`
- Non-Resident Fellows: `https://ifp.org/about/#non-resident-senior-fellows`
- Board Members: `https://ifp.org/about/#external-board-members`
- Careers: `https://ifp.org/opportunities/`
- FAQs: `https://ifp.org/about/#faqs`
- Resources: `#`
- Projects: `https://ifp.org/projects/`
- Courses: `https://ifp.org/economics-of-ideas/`
- The Launch Sequence: `https://ifp.org/the-launch-sequence/`
- The Transit Abundance Playbook: `https://ifp.org/transit-abundance-playbook/`
- Contact: `https://ifp.org/contact/`
- Search: `/?s=`

From `<footer>` in the same file. Courses points at the syllabus, and the about hashes are root-relative:

- Research: `#`
- All Research: `https://ifp.org/latest-publications/`
- Biotechnology: `https://ifp.org/category/biotechnology/`
- Emerging Technology: `https://ifp.org/category/emerging-technology/`
- High-Skilled Immigration: `https://ifp.org/category/high-skilled-immigration/`
- Infrastructure: `https://ifp.org/category/infrastructure/`
- Metascience: `https://ifp.org/category/metascience/`
- About: `https://ifp.org/about/`
- Team: `/about/#team`
- Non-Resident Fellows: `/about/#non-resident-senior-fellows`
- Board Members: `/about/#external-board-members`
- Careers: `https://ifp.org/opportunities/`
- FAQs: `/about/#faqs`
- Resources: `#`
- Projects: `https://ifp.org/projects/`
- Courses: `https://ifp.org/economics-of-ideas/syllabus/`
- The Launch Sequence: `https://ifp.org/the-launch-sequence/`
- The Transit Abundance Playbook: `https://ifp.org/transit-abundance-playbook/`
- LinkedIn, no link text: `https://www.linkedin.com/company/institute-for-progress`
- X, no link text: `https://x.com/IFP`
- And–Now: `https://and-now.co.uk/`
- TGHP: `https://www.tghp.co.uk/`
- Privacy Policy: `https://ifp.org/privacy-policy/`

Team, Non-Resident Fellows, Board Members, and FAQs are hashes on `/about/`, not separate sitemap URLs. No nav or footer href contains an events path. No sitemap `<loc>` is an events archive. Post slugs that contain the letters `event` are ordinary `single-post` URLs and are listed under the post sitemaps.

## Templates

| Template classes                                                                                                                              | URLs                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `wp-singular post-template-default single single-post single-format-standard`                                                                 | 216 unique (`https://ifp.org/climate-relief-cant-wait-for-utopia/` is in both post sitemaps) |
| `archive category`                                                                                                                            | 5                                                                                            |
| `wp-singular opportunities-template-default single single-opportunities`                                                                      | 2                                                                                            |
| `wp-singular page-template page-template-template-reading-list page-template-template-reading-list-php page has-accent-color`                 | 2                                                                                            |
| `home wp-singular page-template page-template-template-home page-template-template-home-php page`                                             | 1                                                                                            |
| `privacy-policy wp-singular page-template-default page`                                                                                       | 1                                                                                            |
| `wp-singular page-template page-template-template-about page-template-template-about-php page has-accent-color`                               | 1                                                                                            |
| `wp-singular page-template page-template-template-contact page-template-template-contact-php page`                                            | 1                                                                                            |
| `wp-singular page-template page-template-template-course-general-content page-template-template-course-general-content-php page`              | 1                                                                                            |
| `wp-singular page-template page-template-template-course-general-content page-template-template-course-general-content-php page page-child`   | 1                                                                                            |
| `wp-singular page-template page-template-template-course-landing page-template-template-course-landing-php page page-parent`                  | 1                                                                                            |
| `wp-singular page-template page-template-template-course-longform-content page-template-template-course-longform-content-php page page-child` | 1                                                                                            |
| `wp-singular page-template page-template-template-newsletters page-template-template-newsletters-php page has-accent-color`                   | 1                                                                                            |
| `wp-singular page-template page-template-template-opportunities page-template-template-opportunities-php page has-accent-color`               | 1                                                                                            |
| `wp-singular page-template page-template-template-post-archive page-template-template-post-archive-php page`                                  | 1                                                                                            |

## `page-sitemap.xml`

13 URLs.

### `wp-singular page-template page-template-template-reading-list page-template-template-reading-list-php page has-accent-color`

- https://ifp.org/transit-abundance-playbook/
- https://ifp.org/the-launch-sequence/

### `home wp-singular page-template page-template-template-home page-template-template-home-php page`

- https://ifp.org/

### `privacy-policy wp-singular page-template-default page`

- https://ifp.org/privacy-policy/

### `wp-singular page-template page-template-template-about page-template-template-about-php page has-accent-color`

- https://ifp.org/about/

### `wp-singular page-template page-template-template-contact page-template-template-contact-php page`

- https://ifp.org/contact/

### `wp-singular page-template page-template-template-course-general-content page-template-template-course-general-content-php page`

- https://ifp.org/independent-filmmaker-project/

### `wp-singular page-template page-template-template-course-general-content page-template-template-course-general-content-php page page-child`

- https://ifp.org/economics-of-ideas/apply/

### `wp-singular page-template page-template-template-course-landing page-template-template-course-landing-php page page-parent`

- https://ifp.org/economics-of-ideas/

### `wp-singular page-template page-template-template-course-longform-content page-template-template-course-longform-content-php page page-child`

- https://ifp.org/economics-of-ideas/syllabus/

### `wp-singular page-template page-template-template-newsletters page-template-template-newsletters-php page has-accent-color`

- https://ifp.org/projects/

### `wp-singular page-template page-template-template-opportunities page-template-template-opportunities-php page has-accent-color`

- https://ifp.org/opportunities/

This project renders `/opportunities` with body class `page-lists`, the same class as `/partners`.

### `wp-singular page-template page-template-template-post-archive page-template-template-post-archive-php page`

- https://ifp.org/latest-publications/

## `post-sitemap1.xml`

200 URLs.

### `wp-singular post-template-default single single-post single-format-standard`

- https://ifp.org/expelling-excellence-exchange-visitor-restrictions-on-high-skill-migrants-in-the-united-states/
- https://ifp.org/strengthening-americas-ai-workforce/
- https://ifp.org/100k-opt-fee/
- https://ifp.org/how-the-permitting-deal-works/
- https://ifp.org/high-skilled-immigration-resources/
- https://ifp.org/scaling-pathogen-detection-with-metagenomics/
- https://ifp.org/preventing-ai-sleeper-agents/
- https://ifp.org/get-the-best-value-in-transit-procurement/
- https://ifp.org/focus-capital-investment-grants-on-improved-project-delivery/
- https://ifp.org/stop-paying-more-for-less-transit/
- https://ifp.org/reform-funding-to-encourage-early-transit-planning/
- https://ifp.org/share-the-truth-about-transit-project-failures/
- https://ifp.org/loans-can-stabilize-transit-funding/
- https://ifp.org/put-transit-staff-in-charge-of-their-own-projects/
- https://ifp.org/close-americas-transit-automation-gap/
- https://ifp.org/let-transit-agencies-buy-land/
- https://ifp.org/fast-track-democratically-approved-transit-projects/
- https://ifp.org/let-agencies-do-their-own-environmental-review/
- https://ifp.org/transit-projects-need-a-single-decision-maker/
- https://ifp.org/use-ai-to-improve-transit-planning/
- https://ifp.org/we-should-know-how-much-transit-components-cost/
- https://ifp.org/eliminate-redundant-subway-cross-passages/
- https://ifp.org/reduce-needless-bus-customization/
- https://ifp.org/explaining-the-proposed-103k-fee-on-h-1bs/
- https://ifp.org/unlocking-a-million-times-more-data-for-ai/
- https://ifp.org/biotechs-lost-archive/
- https://ifp.org/a-sprint-toward-security-level-5/
- https://ifp.org/operation-patchlight/
- https://ifp.org/preparing-for-launch/
- https://ifp.org/what-lessons-should-the-u-s-learn-from-deepseek/
- https://ifp.org/the-arpa-model-a-reading-list/
- https://ifp.org/preparing-for-ai-research-automation/
- https://ifp.org/how-to-build-an-ai-data-center/
- https://ifp.org/funding-for-caisi/
- https://ifp.org/ai-chip-supply-diversion/
- https://ifp.org/rfp-launch/
- https://ifp.org/how-the-nsf-moved-faster-than-the-nih/
- https://ifp.org/broadening-the-knowledge-economy-through-independent-scholarship/
- https://ifp.org/why-biotech-companies-go-to-australia-to-test-new-drugs/
- https://ifp.org/how-to-reuse-the-operation-warp-speed-model/
- https://ifp.org/h1b/
- https://ifp.org/how-to-create-real-permitting-certainty/
- https://ifp.org/ambitious-american-science-requires-reliable-and-effective-federal-funding/
- https://ifp.org/road-section-901/
- https://ifp.org/the-success-of-the-new-federal-housing-law-now-rests-on-states-and-localities/
- https://ifp.org/experience-matters/
- https://ifp.org/testimony-on-washington-dcs-autonomous-vehicle-deployment-authorization-amendment-act/
- https://ifp.org/testimony-the-autonomous-vehicle-deployment-authorization-amendment-act-of-2026/
- https://ifp.org/science-agencies-need-metascience-units/
- https://ifp.org/reforming-section-106-of-the-national-historic-preservation-act/
- https://ifp.org/picking-the-right-challenges-for-genesis-mission/
- https://ifp.org/speed-for-security-bargain-for-ai-data-centers/
- https://ifp.org/how-to-secure-the-dna-supply-chain/
- https://ifp.org/faster-ai-diffusion-through-hardware-based-verification/
- https://ifp.org/the-infinity-project/
- https://ifp.org/the-great-refactor/
- https://ifp.org/a-million-peptide-database-to-defeat-antibiotic-resistance/
- https://ifp.org/mapping-the-brain-for-alignment/
- https://ifp.org/teaching-ai-how-science-actually-works/
- https://ifp.org/scaling-materials-discovery-with-self-driving-labs/
- https://ifp.org/the-replication-engine/
- https://ifp.org/how-x-labs-can-unleash-ai-driven-scientific-breakthroughs/
- https://ifp.org/benchmarking-for-breakthroughs/
- https://ifp.org/the-deliverome-project/
- https://ifp.org/americas-ai-exports-program/
- https://ifp.org/prevailing-wage-benchmarking/
- https://ifp.org/opt-fica-exemption/
- https://ifp.org/pro-housing-supply-to-dos/
- https://ifp.org/interconnection-for-ai/
- https://ifp.org/breaking-the-nepa-litigation-doom-loop/
- https://ifp.org/the-case-for-clinical-trial-abundance/
- https://ifp.org/nlm/
- https://ifp.org/proxy-praxis-why-validating-an-endpoint-took-twelve-years/
- https://ifp.org/protect-human-subjects-not-bureaucracy/
- https://ifp.org/tech-hub-menu/
- https://ifp.org/proxy-praxis-how-surrogate-endpoints-can-speed-drug-development/
- https://ifp.org/accelerating-the-american-scientific-enterprise/
- https://ifp.org/should-the-us-sell-hopper-chips-to-china/
- https://ifp.org/indirect-cost-recovery-and-american-innovation/
- https://ifp.org/using-the-j-1-exchange-visitor-visa-to-support-u-s-companies-in-the-stem-ecosystem/
- https://ifp.org/maximizing-the-scientific-roi-from-international-phds/
- https://ifp.org/environmental-review/
- https://ifp.org/investing-in-biosurveillance/
- https://ifp.org/progress-deferred-lessons-from-mrna-vaccine-development/
- https://ifp.org/most-of-americas-top-ai-companies-were-founded-by-immigrants/
- https://ifp.org/food-reserves-global-food-security/
- https://ifp.org/the-technological-innovations-that-produced-the-shale-revolution/
- https://ifp.org/ai-action-plan/
- https://ifp.org/compute-in-america/
- https://ifp.org/lab-directed-rd-at-the-national-labs/
- https://ifp.org/how-much-should-we-spend-on-replication/
- https://ifp.org/the-b30a-decision/
- https://ifp.org/immigration-powers-american-progress/
- https://ifp.org/how-to-implement-an-operation-warp-speed-for-rare-earths/
- https://ifp.org/catalyzing-a-golden-age/
- https://ifp.org/the-wage-level-mirage/
- https://ifp.org/american-science-should-take-a-lot-more-risks/
- https://ifp.org/special-compute-zones/
- https://ifp.org/how-nepa-will-tax-clean-energy/
- https://ifp.org/defining-major-federal-action-in-nepa/
- https://ifp.org/how-to-prevent-federal-judges-from-killing-new-energy-projects/
- https://ifp.org/seven-frequently-asked-questions-about-nepa/
- https://ifp.org/call-for-proposals-the-transit-policy-playbook/
- https://ifp.org/an-action-plan-for-american-leadership-in-ai/
- https://ifp.org/climate-activists-need-to-radically-change-their-approach-under-trump/
- https://ifp.org/the-h20-problem/
- https://ifp.org/j-1-research-scholar-visa/
- https://ifp.org/no-time-to-visit/
- https://ifp.org/bolstering-stem-talent-with-the-national-interest-waiver/
- https://ifp.org/future-of-ai-compute/
- https://ifp.org/how-to-be-a-policy-entrepreneur-in-the-american-vetocracy/
- https://ifp.org/meeting-u-s-defense-science-and-engineering-workforce-needs-a-progress-report/
- https://ifp.org/stem-immigration-is-critical-to-american-national-security/
- https://ifp.org/nuclear-power-plant-construction-costs/
- https://ifp.org/dwindling-food-reserves-are-a-national-security-risk/
- https://ifp.org/why-barda-deserves-more-funding/
- https://ifp.org/weighing-the-cost-of-the-pandemic/
- https://ifp.org/leveraging-lihtc-for-housing-abundance/
- https://ifp.org/why-forge-works/
- https://ifp.org/sweat-the-small-stuff/
- https://ifp.org/science-orgs-immigration/
- https://ifp.org/response-to-the-epas-request-for-information-on-better-indoor-air-quality-management/
- https://ifp.org/creating-a-public-system-of-national-laboratory-schools/
- https://ifp.org/biden-administrations-actions-on-international-stem-talent/
- https://ifp.org/universities-j1-stem-initiative/
- https://ifp.org/potus-ceq-nepa-reform/
- https://ifp.org/peptides-and-antibiotic-resistance/
- https://ifp.org/what-are-the-chances-an-h5n1-pandemic-is-worse-than-covid/
- https://ifp.org/nist-foundation/
- https://ifp.org/domestic-reissuance/
- https://ifp.org/biosecurity-in-the-trump-era/
- https://ifp.org/o1a-natsec-innovation-base/
- https://ifp.org/an-innovation-agenda-for-addiction/
- https://ifp.org/the-triple-rapid-framework-for-pandemic-diagnostics/
- https://ifp.org/securing-benchtop-dna-synthesizers/
- https://ifp.org/to-speed-scientific-progress-do-away-with-funding-delays/
- https://ifp.org/the-metascience-101-podcast-series/
- https://ifp.org/the-talent-scout-state/
- https://ifp.org/mapping-americas-biosurveillance/
- https://ifp.org/moving-past-environmental-proceduralism/
- https://ifp.org/schedule-a-comments-analysis/
- https://ifp.org/higher-ed-immigration/
- https://ifp.org/international-entrepreneurship-open-letter/
- https://ifp.org/schedule-a-letter/
- https://ifp.org/congress-can-improve-our-pandemic-preparedness/
- https://ifp.org/unlocking-american-agricultural-innovation/
- https://ifp.org/will-we-ever-get-fusion-power/
- https://ifp.org/to-speed-up-scientific-progress-we-need-to-understand-science-policy/
- https://ifp.org/a-cheat-sheet-for-nepa-judicial-reform/
- https://ifp.org/hot-rocks-commercializing-next-generation-geothermal-energy/
- https://ifp.org/a-grand-bargain-for-permitting-reform/
- https://ifp.org/we-must-end-the-litigation-doom-loop/
- https://ifp.org/how-project-nextgen-can-create-better-vaccines/
- https://ifp.org/how-to-make-the-nstc-a-moonshot-success/
- https://ifp.org/how-cost-allocation-works-for-transmission-lines/
- https://ifp.org/no-nepa-really-is-a-problem-for-clean-energy/
- https://ifp.org/can-i-95s-repairs-teach-us-to-build-faster/
- https://ifp.org/how-do-we-make-an-entrepreneurial-state/
- https://ifp.org/creating-advanced-market-commitments-and-prizes-for-pandemic-preparedness/
- https://ifp.org/how-to-save-americas-transmission-system/
- https://ifp.org/progress-is-a-policy-choice/
- https://ifp.org/schedule-a-interactive/
- https://ifp.org/schedule-a/
- https://ifp.org/the-policy-interventions-that-could-boost-geothermal/
- https://ifp.org/h-1b-modernization-rule/
- https://ifp.org/where-can-federal-ai-rd-funding-go-the-furthest/
- https://ifp.org/using-pahpa-to-address-biosecurity-threats/
- https://ifp.org/hot-rocks-part-two-how-public-policy-accelerated-the-shale-revolution/
- https://ifp.org/hot-rocks-part-three-barriers-to-next-gen-geothermal/
- https://ifp.org/mitigating-risks-from-dual-use-research/
- https://ifp.org/preventing-the-misuse-of-breakthrough-health-research/
- https://ifp.org/how-ai-can-help-prevent-biosecurity-disasters/
- https://ifp.org/explaining-bidens-pandemic-preparedness-budget-aspr/
- https://ifp.org/piloting-and-evaluating-nsf-science-lottery-grants/
- https://ifp.org/preventing-the-misuse-of-dna-synthesis/
- https://ifp.org/making-the-cdc-modern/
- https://ifp.org/a-serious-case-for-dynamic-scoring/
- https://ifp.org/how-arpa-hs-use-inspired-research-can-accelerate-progress-in-health/
- https://ifp.org/geothermal-energy-needs-permitting-reform/
- https://ifp.org/how-at-home-rapid-tests-could-prevent-the-next-pandemic/
- https://ifp.org/building-a-better-nih/
- https://ifp.org/indoor-air-quality/
- https://ifp.org/preparing-for-pandemic-preparedness-legislation/
- https://ifp.org/how-darpa-can-anticipate-downside-risk/
- https://ifp.org/how-darpa-can-solve-market-failures-in-emerging-technologies/
- https://ifp.org/interview-waivers/
- https://ifp.org/environmental-assessment-reform/
- https://ifp.org/global-skill-partnership/
- https://ifp.org/time-limit-on-injunctions/
- https://ifp.org/talent-regional-innovation/
- https://ifp.org/can-policymakers-trust-forecasters/
- https://ifp.org/demand-commitment-mechanisms-can-jumpstart-long-term-energy-storage/
- https://ifp.org/the-case-for-agarda/
- https://ifp.org/three-reasons-congress-should-fund-biodefense/
- https://ifp.org/bidens-visa-breakdown/
- https://ifp.org/decarbonization-land-use/
- https://ifp.org/biofuel-mandates-raise-food-and-energy-prices/
- https://ifp.org/drug-pricing-reforms-can-hurt-innovation/
- https://ifp.org/how-to-translate-research-findings-into-policy/
- https://ifp.org/climate-relief-cant-wait-for-utopia/

## `post-sitemap2.xml`

17 URLs.

### `wp-singular post-template-default single single-post single-format-standard`

- https://ifp.org/climate-relief-cant-wait-for-utopia/
- https://ifp.org/the-case-for-high-skilled-immigration/
- https://ifp.org/how-to-maintain-food-supplies-in-future-pandemics/
- https://ifp.org/ifp-welcomes-heidi-williams-as-director-of-science-policy/
- https://ifp.org/expanding-pathways-for-career-research-scientists-in-academia/
- https://ifp.org/semiconductor-investments-wont-pay-off-if-congress-doesnt-fix-the-talent-bottleneck/
- https://ifp.org/preventing-pandemics-requires-funding/
- https://ifp.org/spacex-is-an-underrated-strategic-national-asset-for-the-u-s/
- https://ifp.org/comments-on-prevent-pandemics-discussion-draft/
- https://ifp.org/reducing-recidivism-through-innovation-bringing-opportunities-to-incarcerated-persons-and-prison-tech-startups/
- https://ifp.org/fund-organizations-not-projects-diversifying-americas-innovation-ecosystem-with-a-portfolio-of-independent-research-organizations/
- https://ifp.org/smarter-zoning-for-fair-housing/
- https://ifp.org/improving-graduate-student-mentorship-by-investing-in-traineeship-grants/
- https://ifp.org/taking-emergency-use-authorization-seriously/
- https://ifp.org/curing-alzheimers-by-investing-in-aging-research/
- https://ifp.org/creating-an-ai-testbed-for-government/
- https://ifp.org/unpacking-the-biden-administrations-latest-actions-to-attract-stem-talent-to-the-us/

## `category-sitemap.xml`

5 URLs.

### `archive category`

- https://ifp.org/category/metascience/ — category-metascience category-2
- https://ifp.org/category/high-skilled-immigration/ — category-high-skilled-immigration category-3
- https://ifp.org/category/biotechnology/ — category-biotechnology category-4
- https://ifp.org/category/emerging-technology/ — category-emerging-technology category-5
- https://ifp.org/category/infrastructure/ — category-infrastructure category-15

## `opportunities-sitemap.xml`

2 URLs.

### `wp-singular opportunities-template-default single single-opportunities`

- https://ifp.org/opportunity/editor-associate-editor-editor-or-senior-editor/
- https://ifp.org/opportunity/graphic-designer-data-visualization-artist/

## `post-author-sitemap.xml`

121 URLs.

- https://ifp.org/author/alec-stapp/
- https://ifp.org/author/arika-virapongse/
- https://ifp.org/author/divyansh-kaushik/
- https://ifp.org/author/caleb-watney/
- https://ifp.org/author/nikki-teran/
- https://ifp.org/author/jeremy-neufeld/
- https://ifp.org/author/dan-correa/
- https://ifp.org/author/tamara-winter/
- https://ifp.org/author/willy-chertman/
- https://ifp.org/author/tina-huang/
- https://ifp.org/author/emily-ryan/
- https://ifp.org/author/zachary-graves/
- https://ifp.org/author/brian-potter/
- https://ifp.org/author/matt-clancy/
- https://ifp.org/author/ishan-sharma/
- https://ifp.org/author/tony-mills/
- https://ifp.org/author/eli-dourado/
- https://ifp.org/author/joanne-peng/
- https://ifp.org/author/alec-resnick/
- https://ifp.org/author/shaunalynn-duffy/
- https://ifp.org/author/richard-bruns/
- https://ifp.org/author/t-ben-thompson/
- https://ifp.org/author/sasha-chapin/
- https://ifp.org/author/heidi-williams/
- https://ifp.org/author/pierre-azoulay/
- https://ifp.org/author/ina-ganguli/
- https://ifp.org/author/benjamin-jones/
- https://ifp.org/author/paul-niehaus/
- https://ifp.org/author/adin-richards/
- https://ifp.org/author/juan-cambeiro/
- https://ifp.org/author/arielle-dsouza/
- https://ifp.org/author/arnab-datta/
- https://ifp.org/author/aidan-mackenzie/
- https://ifp.org/author/kyle-myers/
- https://ifp.org/author/austin-vernon/
- https://ifp.org/author/doug-elmendorf/
- https://ifp.org/author/santi-ruiz/
- https://ifp.org/author/todd-moss/
- https://ifp.org/author/lindsay-milliken/
- https://ifp.org/author/bridget-williams/
- https://ifp.org/author/rowan-kane/
- https://ifp.org/author/tim-hwang/
- https://ifp.org/author/amy-nice/
- https://ifp.org/author/matthew-esche/
- https://ifp.org/author/maxwell-tabarrok/
- https://ifp.org/author/ryan-remmel/
- https://ifp.org/author/christopher-snyder/
- https://ifp.org/author/jassi-pannu/
- https://ifp.org/author/jake-swett/
- https://ifp.org/author/janika-schmitt/
- https://ifp.org/author/hamidah-oderinwale/
- https://ifp.org/author/chad-jones/
- https://ifp.org/author/patrick-collard/
- https://ifp.org/author/tim-fist/
- https://ifp.org/author/chris-elmendorf/
- https://ifp.org/author/arushi-gupta/
- https://ifp.org/author/claire-larkin/
- https://ifp.org/author/violet-buxton-walsh/
- https://ifp.org/author/high-skilled-immigration-team/
- https://ifp.org/author/beez/
- https://ifp.org/author/ruxandra-teslo/
- https://ifp.org/author/tao-burga/
- https://ifp.org/author/alex-armlovich/
- https://ifp.org/author/nicholas-bagley/
- https://ifp.org/author/miles-brundage/
- https://ifp.org/author/jacob-feldgoise/
- https://ifp.org/author/matthias-oschinski/
- https://ifp.org/author/pavan-venkatakrishnan/
- https://ifp.org/author/raffa/
- https://ifp.org/author/jonah/
- https://ifp.org/author/saif-khan/
- https://ifp.org/author/witold-wiecek/
- https://ifp.org/author/georgia-adamson/
- https://ifp.org/author/ben-schifman/
- https://ifp.org/author/allan-buchness/
- https://ifp.org/author/nicholas-ritter/
- https://ifp.org/author/sam-marullo/
- https://ifp.org/author/zachary-liscow/
- https://ifp.org/author/arrington-luck/
- https://ifp.org/author/todd-fisher/
- https://ifp.org/author/dan-turner-evans/
- https://ifp.org/author/andrew-gerard/
- https://ifp.org/author/connor-obrien/
- https://ifp.org/author/jay-kim/
- https://ifp.org/author/olivia-jimenez/
- https://ifp.org/author/ben-murphy/
- https://ifp.org/author/rita-sokolova/
- https://ifp.org/author/martin-landray/
- https://ifp.org/author/michael-lingzhi-li/
- https://ifp.org/author/mark-webb/
- https://ifp.org/author/alastair-fraser-urquhart/
- https://ifp.org/author/josh-morrison/
- https://ifp.org/author/jake-ebert/
- https://ifp.org/author/allison-foss/
- https://ifp.org/author/frank-s-david/
- https://ifp.org/author/stuart-buck/
- https://ifp.org/author/enlli-lewis/
- https://ifp.org/author/sam-winter-levy/
- https://ifp.org/author/jason-liang/
- https://ifp.org/author/anastasia-lambrou/
- https://ifp.org/author/gaurav-sett/
- https://ifp.org/author/mike-schmidt/
- https://ifp.org/author/will-poff-webster/
- https://ifp.org/author/reed-schwartz/
- https://ifp.org/author/rohan-aras/
- https://ifp.org/author/andrew-justus/
- https://ifp.org/author/arthur-tellis/
- https://ifp.org/author/brielle-hill/
- https://ifp.org/author/becca-j-carlson/
- https://ifp.org/author/bobby-hollingsworth/
- https://ifp.org/author/joshua-monrad/
- https://ifp.org/author/jenn-gustetic/
- https://ifp.org/author/olivia-scharfman/
- https://ifp.org/author/adam-kroetsch/
- https://ifp.org/author/hunter-wieman/
- https://ifp.org/author/ryan-redmer/
- https://ifp.org/author/joseph-fridman/
- https://ifp.org/author/liam-epstein/
- https://ifp.org/author/hewson-duffy/
- https://ifp.org/author/konstanti-pilz/
- https://ifp.org/author/konstantin-pilz/

## `local-sitemap.xml`

1 URLs.

- https://ifp.org/locations.kml
