// Home Page - Landing con Hero e ricerca trainer
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search, Calendar, Shield, Star, ArrowRight, Users, TrendingUp } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { usePageTitle } from '../hooks/usePageTitle'

export default function HomePage() {
  usePageTitle('Home')
  const navigate = useNavigate()
  const { t } = useI18n()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchCity, setSearchCity] = useState('')

  const features = [
    {
      icon: Search,
      title: t('homeSearch'),
      description: t('homeSubtitle')
    },
    {
      icon: Calendar,
      title: t('homeFeatureBookingTitle'),
      description: t('homeFeatureBookingDesc')
    },
    {
      icon: Shield,
      title: t('homeFeatureVerifiedTitle'),
      description: t('homeFeatureVerifiedDesc')
    },
    {
      icon: Star,
      title: t('homeFeatureReviewsTitle'),
      description: t('homeFeatureReviewsDesc')
    }
  ]

  const stats = [
    { value: '500+', label: t('homeStatCertified') },
    { value: '10k+', label: t('homeStatCompleted') },
    { value: '4.8/5', label: t('homeStatRating') },
    { value: '100+', label: t('homeStatCities') }
  ]

  const specializations = [
    { label: `💪 ${t('homeSpecBodybuilding')}`, query: 'Bodybuilding' },
    { label: `🏃‍♂️ ${t('homeSpecRunning')}`, query: 'Running' },
    { label: `🧘‍♀️ ${t('homeSpecYoga')}`, query: 'Yoga' },
    { label: `🤸‍♂️ ${t('homeSpecCrossfit')}`, query: 'CrossFit' },
    { label: `🥊 ${t('homeSpecBoxing')}`, query: 'Boxe' },
    { label: `🏋️ ${t('homeSpecPowerlifting')}`, query: 'Powerlifting' }
  ]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchKeyword.trim()) params.set('specialization', searchKeyword.trim())
    if (searchCity.trim()) params.set('location', searchCity.trim())
    navigate(`/trainers?${params.toString()}`)
  }

  const handlePopularClick = (spec) => {
    navigate(`/trainers?specialization=${encodeURIComponent(spec.query)}`)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative text-white py-20 md:py-28 overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover scale-105"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1571019613914-85f342c1d4b2?auto=format&fit=crop&w=1800&q=80"
        >
          <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=0b7443d3e6f5f3da4fbb0ce9a5f91020f0fbead5&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-primary-900/70" />
        <div className="absolute -top-14 -left-14 w-56 h-56 rounded-full bg-white/10 blur-2xl float-y" />
        <div className="absolute bottom-6 right-10 w-64 h-64 rounded-full bg-primary-400/20 blur-3xl float-y-delay" />

        <div className="container-custom relative z-10">
          <div className="max-w-3xl reveal-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              {t('homeTitleLine1')}
              <span className="block text-primary-200">{t('homeTitleLine2')}</span>
              {t('homeTitleLine3')}
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              {t('homeSubtitle')}
            </p>

            {/* Search Bar */}
            <div className="bg-white/95 backdrop-blur rounded-xl p-2 shadow-2xl flex flex-col md:flex-row gap-2 reveal-up-delay">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={t('homeSearchPlaceholder')}
                  className="w-full px-12 py-3 rounded-lg text-gray-900 focus:outline-none"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder={t('homeCityPlaceholder')}
                  className="w-full md:w-48 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="btn-primary whitespace-nowrap flex items-center justify-center gap-2 py-3 px-6"
              >
                {t('homeSearch')}
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Quick Specializations */}
            <div className="mt-6 reveal-up-delay-2">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-primary-200">{t('homePopular')}</span>
                {specializations.map((spec, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularClick(spec)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/35 rounded-full text-sm transition hover:-translate-y-0.5"
                  >
                    {spec.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-primary-200/90 mt-2">{t('homeChooseTag')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center reveal-up" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16 reveal-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('homeWhyTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('homeWhySubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover text-center reveal-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={32} className="text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for Trainers */}
      <section className="py-20 bg-gradient-to-r from-fitness-purple to-fitness-blue text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center reveal-up">
            <Users size={48} className="mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              {t('homeTrainerCtaTitle')}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t('homeTrainerCtaText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register?role=trainer"
                className="bg-white text-fitness-purple px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                {t('homeTrainerCtaPrimary')}
                <ArrowRight size={20} />
              </Link>
              <Link to="/trainers" className="border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition">
                {t('homeTrainerCtaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl p-12 text-center reveal-up">
            <TrendingUp size={48} className="mx-auto text-primary-600 mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('homeFinalTitle')}
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('homeFinalText')}
            </p>
            <Link
              to="/trainers"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              {t('homeFinalButton')}
              <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
