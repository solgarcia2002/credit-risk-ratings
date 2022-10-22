import {useEffect, useState} from 'react'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

interface Company {
  [key: string]: string | number;
}

interface Metrics {
  [key: string]: string | number;
}

const Calculator = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<Metrics[]>([])
  const [groupedFinancialMetrics, setGroupedFinancialMetrics] = useState<Metrics[]>([])

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
          const currentCompany = companies.find(company => company.company_id === companyAttributes[key])
          companyJson['company_name'] = currentCompany?.company_name ?? ''
        }
        companyJson[ch] = companyAttributes[key]
      })
      JsonList.push(companyJson)
    })
    return JsonList
  }
  const getCompanies = async () => {
    const appCompanies = await fetch('/app-companies.csv')
    setCompanies(parseCsv(await appCompanies.text()))
  }
  const getFinancialMetrics = async () => {
    const financialMetrics = await fetch('/app-financial-metrics.csv')
    setFinancialMetrics(parseCsv(await financialMetrics.text(), true))
  }
  useEffect(() => {
    getCompanies()
    getFinancialMetrics()
  }, [])

  useEffect(() => {
    //calculate payback period
    if (!financialMetrics?.length) return
    const groupedByApp = financialMetrics.reduce((r, a) => {
      r[a.app_name] = r[a.app_name] || [];
      r[a.app_name].push(a);
      return r;
    }, Object.create(null));
    setGroupedFinancialMetrics(groupedByApp)

  }, [financialMetrics])
  useEffect(() => {
    //For Each App
    Object.keys(groupedFinancialMetrics).forEach((app_name: string) => {
      const mktSpendRow = groupedFinancialMetrics[app_name].find((app: any) => app.marketing_spend > 0)
      const monthlyRevenue = groupedFinancialMetrics[app_name].reduce((a: string, b: string) => Number.parseFloat(a) + (Number.parseFloat(b['revenue']) || 0), 0)
      const revenueAv = monthlyRevenue / 31
      const markentingSpend = Number.parseFloat(mktSpendRow.marketing_spend)
      groupedFinancialMetrics[app_name]['playbackPeriod'] = Math.ceil( markentingSpend / revenueAv)
      groupedFinancialMetrics[app_name]['LVT_CAC'] = monthlyRevenue/ markentingSpend
      //para calcular el score mapear las 2 tablas de puntajes y realizar el calculo (paybackScore*0.7) + (LVT_CACScore * 0.3)
      // mapear la ultima tabla para obtener el risk score
      const riskScore =0
    })
  }, [groupedFinancialMetrics])
  console.log(groupedFinancialMetrics)
  return <Stack spacing={1}>
    <Skeleton variant="rounded" width={310} height={60}/>
    <Skeleton variant="rectangular" width={310} height={60}/>
    <Skeleton variant="rectangular" width={310} height={60}/>
    <Skeleton variant="rectangular" width={310} height={60}/>
  </Stack>
}
export default Calculator
