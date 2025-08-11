'use client';

import React, { useEffect, useRef } from 'react';
import './landing.css';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@/hooks/use-theme';
import {
  faArrowRight,
  faChartBar,
  faUsers,
  faGraduationCap,
  faDollarSign,
  faShield,
  faBolt,
  faGlobe,
  faAward,
  faArrowTrendUp,
  faBookOpen,
  faBuilding,
  faCheckCircle,
  faPlay,
  faPause,
  faUniversity,
  faChartLine,
  faUserGraduate,
  faMoneyBillWave,
  faLaptop,
  faCode,
  faPalette,
  faDatabase,
  faRocket,
  faMagic
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LandingNavigation } from '@/components/landing/navigation';
import { InteractiveDemo } from '@/components/landing/interactive-demo';

// 3D Card Component with animations
const Feature3DCard = ({
  icon,
  title,
  description,
  delay = 0
}: {
  icon: any;
  title: string;
  description: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{
        scale: 1.02,
        rotateY: 2,
        boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25)"
      }}
      className="group perspective-1000"
    >
      <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform-gpu">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon icon={icon} className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Floating 3D Dashboard Preview
const Dashboard3DPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative perspective-1000"
    >
      <div className="relative transform-gpu hover:scale-105 transition-transform duration-500">
        {/* Main Dashboard Container */}
        <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-white text-sm font-medium">INES-Ruhengeri Dashboard</div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Students", value: "1,518", color: "from-blue-500 to-blue-600" },
              { label: "Programs", value: "24", color: "from-green-500 to-green-600" },
              { label: "Collections", value: "192M RWF", color: "from-purple-500 to-purple-600" },
              { label: "Performance", value: "94.5%", color: "from-orange-500 to-orange-600" }
            ].map((kpi, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`bg-gradient-to-r ${kpi.color} rounded-xl p-4 text-white`}
              >
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-sm opacity-90">{kpi.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-white text-sm mb-3">Enrollment Trends</div>
              <div className="h-20 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-lg"></div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-white text-sm mb-3">Financial Overview</div>
              <div className="h-20 bg-gradient-to-r from-green-400/30 to-blue-400/30 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg"
        />
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full shadow-lg"
        />
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const { theme } = useTheme();

  // Theme-aware features
  const getFeatures = () => {
    const baseFeatures = [
      {
        icon: faChartBar,
        title: effectiveTheme === 'light' ? "Comprehensive Dashboard" : "AI-Powered Analytics",
        description: effectiveTheme === 'light'
          ? "12 KPI cards and 5 interactive charts providing real-time insights into institutional performance with beautiful visualizations."
          : "Advanced machine learning algorithms analyze institutional data to provide predictive insights and automated recommendations."
      },
      {
        icon: faDollarSign,
        title: effectiveTheme === 'light' ? "Financial Management (RWF)" : "Smart Financial Operations",
        description: effectiveTheme === 'light'
          ? "Complete financial operations in Rwandan Francs including fee collection, budgeting, accounting, and compliance reporting."
          : "AI-driven financial forecasting and automated transaction processing with blockchain-secured RWF operations."
      },
      {
        icon: faGraduationCap,
        title: effectiveTheme === 'light' ? "Academic Administration" : "Intelligent Academic System",
        description: effectiveTheme === 'light'
          ? "Student enrollment, program management, performance tracking, and academic calendar with comprehensive reporting."
          : "Machine learning-powered student success prediction, automated scheduling, and personalized learning path recommendations."
      },
      {
        icon: faUsers,
        title: effectiveTheme === 'light' ? "Human Resources" : "Digital Workforce Management",
        description: effectiveTheme === 'light'
          ? "Staff management, payroll processing, benefits administration, and performance tracking for institutional excellence."
          : "AI-enhanced talent management with predictive performance analytics and automated workflow optimization."
      },
      {
        icon: faShield,
        title: effectiveTheme === 'light' ? "Role-Based Security" : "Advanced Cybersecurity",
        description: effectiveTheme === 'light'
          ? "Advanced permission system with roles for Admin, Bursar, Store Manager, Academic Staff, and Auditor access control."
          : "Zero-trust security architecture with biometric authentication, behavioral analysis, and quantum-encrypted data protection."
      },
      {
        icon: faGlobe,
        title: effectiveTheme === 'light' ? "Rwandan Localization" : "Global Digital Integration",
        description: effectiveTheme === 'light'
          ? "Built specifically for Rwanda with RWF currency, Africa/Kigali timezone, and local compliance requirements."
          : "Seamless integration with global educational networks while maintaining local compliance and cultural adaptation."
      }
    ];
    return baseFeatures;
  };

  const features = getFeatures();

  // Theme-aware content
  const themeContent = {
    light: {
      hero: {
        badge: "Institut d'Enseignement Supérieur de Ruhengeri",
        title: "INES-Ruhengeri ERP System",
        description: "A comprehensive, production-ready ERP system designed specifically for Rwanda's leading higher education institution. Manage academics, finances, HR, and operations with beautiful dashboards and RWF currency support.",
        primaryCTA: "Access Dashboard",
        secondaryCTA: "Watch Demo"
      },
      stats: [
        { number: "1,518", label: "Active Students", icon: faUsers },
        { number: "24", label: "Academic Programs", icon: faBookOpen },
        { number: "192M", label: "RWF Collections", icon: faDollarSign },
        { number: "94.5%", label: "Success Rate", icon: faArrowTrendUp }
      ],
      features: {
        title: "Powerful Features for Educational Excellence",
        subtitle: "Everything you need to manage a modern higher education institution, built with cutting-edge technology and designed for the Rwandan context."
      },
      demo: {
        title: "See It In Action",
        subtitle: "Watch how INES-Ruhengeri ERP transforms institutional management with intuitive dashboards and powerful features."
      }
    },
    dark: {
      hero: {
        badge: "Advanced Digital Campus Solution",
        title: "INES-Ruhengeri Digital Campus",
        description: "Experience the future of educational management with our cutting-edge ERP platform. Powered by advanced analytics, AI-driven insights, and seamless integration for Rwanda's premier institution.",
        primaryCTA: "Enter Platform",
        secondaryCTA: "Explore Features"
      },
      stats: [
        { number: "1,518", label: "Digital Students", icon: faUsers },
        { number: "24", label: "Smart Programs", icon: faBookOpen },
        { number: "192M", label: "Digital Revenue", icon: faDollarSign },
        { number: "94.5%", label: "AI Efficiency", icon: faArrowTrendUp }
      ],
      features: {
        title: "Advanced Technology for Digital Excellence",
        subtitle: "Cutting-edge solutions powered by AI and machine learning, designed for the digital transformation of higher education in Rwanda."
      },
      demo: {
        title: "Experience the Future",
        subtitle: "Discover how our AI-powered platform revolutionizes educational management with intelligent automation and predictive analytics."
      }
    }
  };

  // Get the effective theme (resolve 'system' to actual theme)
  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  const effectiveTheme = getEffectiveTheme();
  const currentContent = themeContent[effectiveTheme] || themeContent.light;

  return (
    <div className={`min-h-screen overflow-hidden transition-all duration-1000 ${
      effectiveTheme === 'light'
        ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        : 'bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900'
    }`}>
      {/* Navigation */}
      <LandingNavigation />
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-12">
        <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
          <div className={`absolute top-16 left-16 w-56 h-56 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob transition-all duration-1000 ${
            effectiveTheme === 'light' ? 'bg-blue-300' : 'bg-cyan-400 dark:opacity-40'
          }`}></div>
          <div className={`absolute top-32 right-16 w-56 h-56 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 transition-all duration-1000 ${
            effectiveTheme === 'light' ? 'bg-purple-300' : 'bg-purple-400 dark:opacity-40'
          }`}></div>
          <div className={`absolute bottom-16 left-32 w-56 h-56 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 transition-all duration-1000 ${
            effectiveTheme === 'light' ? 'bg-pink-300' : 'bg-pink-400 dark:opacity-40'
          }`}></div>
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-4"
            >
              <FontAwesomeIcon icon={faAward} className="w-3 h-3 mr-2" />
              {currentContent.hero.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight"
            >
              {effectiveTheme === 'light' ? (
                <>
                  INES-Ruhengeri
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                    ERP System
                  </span>
                </>
              ) : (
                <>
                  INES-Ruhengeri
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent block">
                    Digital Campus
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed max-w-2xl"
            >
              {currentContent.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Link href="/login">
                <Button size="lg" className={`${effectiveTheme === 'light'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                } text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group`}>
                  {currentContent.hero.primaryCTA}
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-6 py-3 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 group">
                <FontAwesomeIcon icon={faPlay} className="mr-2 w-4 h-4" />
                {currentContent.hero.secondaryCTA}
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <Dashboard3DPreview />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {currentContent.stats.map((stat: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon icon={stat.icon} className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="dashboard" className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentContent.demo.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {currentContent.demo.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group cursor-pointer"
          >
            <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-8 shadow-2xl overflow-hidden">
              {/* Video Placeholder */}
              <div className="aspect-video bg-black/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faPlay} className="w-8 h-8 text-white ml-1" />
                </motion.div>

                {/* Animated Background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-4 left-4 w-32 h-20 bg-blue-500/30 rounded-lg"></div>
                  <div className="absolute top-4 right-4 w-24 h-16 bg-purple-500/30 rounded-lg"></div>
                  <div className="absolute bottom-4 left-4 w-40 h-24 bg-green-500/30 rounded-lg"></div>
                  <div className="absolute bottom-4 right-4 w-28 h-20 bg-orange-500/30 rounded-lg"></div>
                </div>
              </div>

              {/* Video Info */}
              <div className="mt-6 text-white">
                <h3 className="text-xl font-semibold mb-2">Complete System Walkthrough</h3>
                <p className="text-gray-300">5-minute overview of all features and capabilities</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {effectiveTheme === 'light' ? (
                <>
                  Powerful Features for
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                    Educational Excellence
                  </span>
                </>
              ) : (
                <>
                  Advanced Technology for
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent block">
                    Digital Excellence
                  </span>
                </>
              )}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {currentContent.features.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Feature3DCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Testimonials Section */}
      <section className={`py-20 transition-all duration-1000 ${
        effectiveTheme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {effectiveTheme === 'light' ? 'Trusted by Educational Leaders' : 'Pioneering Digital Transformation'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {effectiveTheme === 'light'
                ? 'See what administrators and staff say about our ERP system.'
                : 'Leading institutions share their digital transformation journey with our AI-powered platform.'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Jean Baptiste Uwimana",
                role: "Rector, INES-Ruhengeri",
                content: "This ERP system has revolutionized how we manage our institution. The financial tracking in RWF and comprehensive dashboards give us unprecedented visibility into our operations.",
                avatar: "👨‍🎓"
              },
              {
                name: "Marie Claire Mukamana",
                role: "Bursar",
                content: "The fee collection and financial management modules have streamlined our processes significantly. The RWF integration makes accounting much more straightforward for our Rwandan context.",
                avatar: "👩‍💼"
              },
              {
                name: "Emmanuel Nkurunziza",
                role: "IT Director",
                content: "The system is incredibly well-built with modern technology. The role-based access control and comprehensive reporting features exceed our expectations.",
                avatar: "👨‍💻"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your institution's needs. All prices in Rwandan Francs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "500,000",
                period: "per month",
                description: "Perfect for small institutions",
                features: [
                  "Up to 500 students",
                  "Basic dashboard",
                  "Financial management",
                  "Email support",
                  "Mobile access"
                ],
                popular: false
              },
              {
                name: "Professional",
                price: "1,200,000",
                period: "per month",
                description: "Ideal for growing institutions",
                features: [
                  "Up to 2,000 students",
                  "Advanced analytics",
                  "HR management",
                  "Priority support",
                  "API access",
                  "Custom reports"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "contact us",
                description: "For large institutions",
                features: [
                  "Unlimited students",
                  "Custom integrations",
                  "Dedicated support",
                  "On-premise option",
                  "Training included",
                  "SLA guarantee"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">RWF {plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-3 rounded-xl transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powered by the latest web technologies for performance, scalability, and maintainability.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "Next.js 15", icon: faRocket },
              { name: "TypeScript", icon: faCode },
              { name: "Tailwind CSS", icon: faPalette },
              { name: "React Query", icon: faDatabase },
              { name: "Recharts", icon: faChartLine },
              { name: "FontAwesome", icon: faMagic }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                className="text-center group cursor-pointer"
              >
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                  <FontAwesomeIcon icon={tech.icon} className="text-3xl text-white" />
                </div>
                <div className="text-sm font-medium">{tech.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Institution?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join INES-Ruhengeri in revolutionizing higher education management with our comprehensive ERP system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="px-8 py-4 rounded-xl text-blue-600 hover:text-blue-700 transition-all duration-300 group">
                  Start Free Trial
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 rounded-xl border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FontAwesomeIcon icon={faBuilding} className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">INES-Ruhengeri ERP</span>
              </div>
              <p className="text-gray-400">
                Comprehensive ERP solution for higher education institutions in Rwanda.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Dashboard & Analytics</li>
                <li>Financial Management</li>
                <li>Academic Administration</li>
                <li>Human Resources</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Technology</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Next.js & TypeScript</li>
                <li>Modern UI/UX</li>
                <li>Real-time Updates</li>
                <li>Mobile Responsive</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>info@ines.ac.rw</li>
                <li>+250 788 123 456</li>
                <li>Ruhengeri, Rwanda</li>
                <li>Northern Province</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 INES-Ruhengeri ERP System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
