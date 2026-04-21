import Card from "../../card/default/Card";
import CustomLineChart from "../../charts/custonLineChart/CustonLineChart";
import KpiBenchmarkTable from "../kpiBenchmarkTable/KpiBenchmarkTable"
import styles from "./CampaignPerformanceOverview.module.css";


const section = [
	{
		title: "KPI’s",
		rows: [
			{
				label: "OOH",
				costs: "$3,600,000",
				impressions: "617,650,000",
				clicks: "-",
				ctr: "-",
				cpc: "-"
			},
			{
				label: "Social",
				costs: "$3,200,000",
				impressions: "9,221,210,935",
				clicks: "4,619,050",
				ctr: "0.05%",
				cpc: "$0.7"
			}
		]
	},
	{
		title: "Benchmarks",
		rows: [
			{
				label: "OOH",
				costs: "$4,000,000",
				impressions: "500,000,000",
				clicks: "-",
				ctr: "-",
				cpc: "-"
			},
			{
				label: "Social",
				costs: "$3,200,000",
				impressions: "5,000,371",
				clicks: "3,000,000",
				ctr: "0.03%",
				cpc: "$0.7"
			}
		]
	}
]

const summaryData = [
	{
  name: "Segment Name",
  title: "Segment Summary",
  data: [
    {
      category: "Visa Primed Switcher",
      impressions: "254,831",
      CTR: "0.12%",
      benchmark: "0.06%"
    } ]
  },
	{
  name: "Product Name",
  title: "Product Summary",
  data: [
    {
      category: "Visa_ProMovePilot_EDU_TikTok_ProMoveExplainers",
      impressions: "2,184,550",
      CTR: "0.92%",
      benchmark: "-"
    },
    {
      category: "Visa_ProMovePilot_AW_Instagram_FeedToStoriesImpact",
      impressions: "1,743,880",
      CTR: "0.68%",
      benchmark: "-"
    },
    {
      category: "Visa_ProMovePilot_EDU_Reddit_ProofPointsAndFAQs",
      impressions: "1,102,330",
      CTR: "0.21%",
      benchmark: "-"
    },
    {
      category: "Visa_ProMovePilot_AW_Pinterest_DiscoveryAndSave",
      impressions: "1,864,990",
      CTR: "0.31%",
      benchmark: "-"
    },
    {
      category: "Visa_ProMovePilot_EDU_Spotify_AudioLearnMore",
      impressions: "3,442,110",
      CTR: "0.04%",
      benchmark: "-"
    },
    {
      category: "Visa_ProMovePilot_AW_SiriusXM_BroadAudioReach",
      impressions: "2,998,770",
      CTR: "0.03%",
      benchmark: "-"
    },
    {
      category: "Visa_ProMovePilot_EDU_iHeart_BehaviourReframeAudio",
      impressions: "2,511,660",
      CTR: "0.05%",
      benchmark: "-"
    },
    {
      category: "Visa_ProMovePilot_AW_GumGum_ContextualDisplayRetarget",
      impressions: "1,334,420",
      CTR: "0.18%",
      benchmark: "-"
    }
  ]
}
];

export function CampaingPerformanceOverview() {
	return (
		<div className={styles.bottomSection}>
			<KpiBenchmarkTable sections={section} />
			<div className={styles.bannerWrapper}>
				<Card className={styles.bannerCard} heading="Campaign name" headingSize="small">
					<div className={styles.bannerContent}>
						<div className={styles.bannerContentLeft}>
							<p>Visa Pro Move Campaign</p>
						</div>
						<div className={styles.bannerContentRight}>
							<p>
								<div>27,137,145</div>
								{/* <span style={{ fontSize: "20px", marginTop: "-40px" }}>Influencers Content</span> */}
							</p>
							<p>Impressions</p>
						</div>
					</div>
				</Card>
				<div className={styles.summaries}>
					{summaryData.map((item, index) => (
						<Card key={index} heading={item.title} className={styles.summaryCard}>
							<div className={styles.summaryTable}>
								<div className={styles.summaryTableHeader}>

									<div className={styles.summaryTableHeaderItem}> {item.title === "Segment Summary" ? 'Segment Name' : 'Product Name'}</div>
									<div className={styles.summaryTableHeaderItem}>Impressions</div>
									<div className={styles.summaryTableHeaderItem}>CTR</div>
									<div className={styles.summaryTableHeaderItem}>Benchmark</div>
								</div>
								<div className={styles.summaryTableContent}>
									{item.data.map((row, index) => (
										<div
											key={index}
											className={styles.summaryTableRow}
											style={{
												backgroundColor: index % 2 === 0 ? "var(--color-gray-light)" : "",
											}}
										>
											<div className={styles.summaryTableRowItem}>{row.category}</div>
											<div className={styles.summaryTableRowItem}>{row.impressions}</div>
											<div className={styles.summaryTableRowItem}>{row.CTR}</div>
											<div className={styles.summaryTableRowItem}>{row.benchmark}</div>
										</div>
									))}
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
			<Card heading="Clicks and CTR by date">
				<CustomLineChart />
			</Card>
		</div>
	);
}

export default CampaingPerformanceOverview;
