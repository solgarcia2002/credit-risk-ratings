import {Fragment, useEffect, useState} from 'react'
import {CSVLink} from "react-csv"
import {riskTable, paybackScoreTable, LTV_CACScoreTable} from "../config/riskConfig"
import {styled} from '@mui/material/styles'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, {tableCellClasses} from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

/**----Types ---*/
interface Company {
  [key: string]: string | number;
}

interface Metrics {
  [key: string]: string | number;
}


interface AppSummary {
  appName: string;
  companyId: string;
  companyName: string;
  riskScore: number,
  riskValuation: number,
  riskValuationLabel: string,
}

/**----End Of Types ---*/

/**---- Styles ----*/
const StyledTableCell = styled(TableCell)(({theme}) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&.Undoubted': {
    backgroundColor: '#caf9ca',
  },
  '&.Low': {
    backgroundColor: '#e4f7ca',
  },
  '&.Moderate': {
    backgroundColor: '#eef4c8',
  },
  '&.Cautionary': {
    backgroundColor: '#f2edc6',
  },
  '&.Unsatisfactory': {
    backgroundColor: '#efe3c4',
  },
  '&.Unacceptable': {
    backgroundColor: '#edd4c4',
  },
}));

const StyledCSVLink = styled(CSVLink)({
  backgroundColor: 'black',
  color: '#fff',
  display: 'inline-block',
  float: 'right',
  margin: '2rem',
  padding: '1.5rem',
});

/**---- End Of Styles ----*/

const Calculator = () => {
  /**--- Component States ---*/
  const [companies, setCompanies] = useState<Company[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<Metrics[]>([])
  const [groupedFinancialMetrics, setGroupedFinancialMetrics] = useState<Metrics[]>([])
  const [appSummaryList, setAppSummaryList] = useState<any[]>([])

  /**--- End Of Component States ---*/
  /***
   * Parse CSV function takes the information stored in the CSV and returns a JSON
   * @param CSV: string
   * @param addCompanyName: boolean (false by default)
   */
  const parseCsv = (CSV: string, addCompanyName: boolean = false) => {
    const list = CSV.split('\r\n')
    const header = list[0].split(',');
    const listBody = list.slice(1)
    const JsonList: Company[] = [];
    listBody.forEach(row => {
      const companyAttributes = row.split(',')
      const companyJson: Company = {}
      header.forEach((ch: string, key: number) => {
        if (ch === 'company_id' && companies.length > 0 && addCompanyName) {
          const currentCompany = companies.find((company: Company) => company.company_id === companyAttributes[key])
          companyJson['company_name'] = currentCompany?.company_name ?? ''
        }
        companyJson[ch] = companyAttributes[key]
      })
      JsonList.push(companyJson)
    })
    return JsonList
  }
  /***
   * getSummaryApp an object for each application after making all the necessary
   * calculations in order to find the risk score
   *
   * @param app_name: string
   * @returns appSummary: AppSummary
   */
  const getSummaryApp = (app_name: string) => {
    if (!groupedFinancialMetrics[app_name]) return null;
    const appMetrics = groupedFinancialMetrics[app_name]

    const mktSpendRow = appMetrics.find((app: Metrics) => app.marketing_spend > 0)
    const monthlyRevenue = appMetrics.reduce((a: string, b: string) => Number.parseFloat(a) + (Number.parseFloat(b['revenue']) || 0), 0)
    const revenueAv = monthlyRevenue / 31
    const marketingSpend = Number.parseFloat(mktSpendRow.marketing_spend)
    const playbackPeriod = Math.ceil(marketingSpend / revenueAv)
    const LVT_CAC = Number.parseFloat((monthlyRevenue / marketingSpend).toFixed(2))
    const paybackScoreItem = paybackScoreTable.find((tableItem) =>
      (playbackPeriod >= tableItem.min && playbackPeriod <= tableItem.max))
    const LTV_CACScoreItem = LTV_CACScoreTable.find((tableItem) =>
      (LVT_CAC >= tableItem.min && LVT_CAC <= tableItem.max))

    const riskScore = (paybackScoreItem?.score ?? 0 * 0.7) + (LTV_CACScoreItem?.score ?? 0 * 0.3)
    const riskItem = riskTable.find((tableItem) =>
      (riskScore >= tableItem.min && riskScore <= tableItem.max))
    const appSummary: AppSummary = {
      appName: app_name,
      companyId: appMetrics[0].company_id,
      companyName: getCompanyNameById(appMetrics[0].company_id),
      riskScore,
      riskValuation: riskItem?.score ?? 6,
      riskValuationLabel: riskTable.find(rt => riskItem?.score === rt.score)?.label ?? ''
    }
    return appSummary;
  }

  /***
   * getCompanies fetch the 'app-companies.csv' file in order to obtain the company list
   */
  const getCompanies = async () => {
    const appCompanies = await fetch('/app-companies.csv')
    setCompanies(parseCsv(await appCompanies.text()))
  }

  /***
   * getCompanies fetch the 'app-financial-metrics.csv' file in order to obtain the metrics for all apps
   */
  const getFinancialMetrics = async () => {
    const financialMetrics = await fetch('/app-financial-metrics.csv')
    setFinancialMetrics(parseCsv(await financialMetrics.text(), true))
  }

  /**
   * Returns the company name based on the given id
   * @param id: string
   * @returns companyName: string
   */
  const getCompanyNameById = (id: string) => {
    const company = companies.find(company => company.company_id === id)
    return company?.company_name.toString() ?? ''
  }

  /***
   * This function takes the financialMetrics list and create an Object with a financialMetrics list for each app
   * @returns groupedFinancialMetrics: Object
   */
  const getFinancialMetricsGroupedByApp = ()=>{
   return financialMetrics.reduce((r, a) => {
      r[a.app_name] = r[a.app_name] || [];
      r[a.app_name].push(a);
      return r;
    }, Object.create(null));
  }

  /***
   * Get CSVs
   */
  useEffect(() => {
    getCompanies()
    getFinancialMetrics()
  }, [])

  /***
   * On changing financialMetrics group them by App
   */
  useEffect(() => {
    if (!financialMetrics?.length) return
    setGroupedFinancialMetrics(getFinancialMetricsGroupedByApp)
  }, [financialMetrics])

  /***
   * On changing groupedFinancialMetrics calculates the risk for each App and store it in a
   * list sorted by Risk Score descendant
   */
  useEffect(() => {
    const appList: AppSummary[] = []
    Object.keys(groupedFinancialMetrics).forEach((app_name: string) => {
      const summaryApp = getSummaryApp(app_name);
      if (summaryApp) appList.push(summaryApp)
    })
    const appListSortedByRiskScore = appList.sort((a, b) => b.riskScore - a.riskScore)
    setAppSummaryList(appListSortedByRiskScore)
  }, [groupedFinancialMetrics])


  return <Fragment>
    {(appSummaryList.length > 0) && <TableContainer component={Paper}>
      <StyledCSVLink data={appSummaryList} target="_blank">Download CSV</StyledCSVLink>
      <Table sx={{minWidth: 700}} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>App Name</StyledTableCell>
            <StyledTableCell align="right">Company Id</StyledTableCell>
            <StyledTableCell align="right">Company Name</StyledTableCell>
            <StyledTableCell align="right">Risk Score</StyledTableCell>
            <StyledTableCell align="right">Risk Rating</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appSummaryList.map((row) => (
            <StyledTableRow key={row.appName} className={row.riskValuationLabel}>
              <StyledTableCell component="th" scope="row">
                {row.appName}
              </StyledTableCell>
              <StyledTableCell align="right">{row.companyId}</StyledTableCell>
              <StyledTableCell align="right">{row.companyName}</StyledTableCell>
              <StyledTableCell align="right">{row.riskScore}</StyledTableCell>
              <StyledTableCell align="right">{row.riskValuationLabel}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>}
    {appSummaryList.length === 0 && <Stack spacing={1}>
      <Skeleton variant="rounded" width={310} height={60}/>
      <Skeleton variant="rectangular" width={310} height={60}/>
      <Skeleton variant="rectangular" width={310} height={60}/>
      <Skeleton variant="rectangular" width={310} height={60}/>
    </Stack>}
  </Fragment>
}
export default Calculator
