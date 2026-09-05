import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Metrics from '../components/Metrics'
import Capabilities from '../components/Capabilities'
import FeatureSections from '../components/FeatureSections'
import HowItWorks from '../components/HowItWorks'
import Security from '../components/Security'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <Nav />
      <main>
        <Hero />
        <Metrics />
        <Capabilities />
        <FeatureSections />
        <HowItWorks />
        <Security />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
