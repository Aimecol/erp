'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faUsers,
  faDollarSign,
  faGraduationCap,
  faArrowTrendUp,
  faCalendar,
  faTimes,
  faPlay,
  faPause
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DemoFeature {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  demo: React.ReactNode;
}

export function InteractiveDemo() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const features: DemoFeature[] = [
    {
      id: 'dashboard',
      title: 'Real-time Dashboard',
      description: 'Monitor all KPIs and metrics in one place',
      icon: faChartBar,
      color: 'from-blue-500 to-blue-600',
      demo: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white"
            >
              <div className="text-2xl font-bold">1,518</div>
              <div className="text-sm opacity-90">Total Students</div>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white"
            >
              <div className="text-2xl font-bold">192M</div>
              <div className="text-sm opacity-90">RWF Collections</div>
            </motion.div>
          </div>
          <div className="h-32 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-lg flex items-center justify-center">
            <motion.div
              animate={{ width: ['20%', '80%', '60%', '90%'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded"
            />
          </div>
        </div>
      )
    },
    {
      id: 'students',
      title: 'Student Management',
      description: 'Track enrollment, performance, and graduation',
      icon: faUsers,
      color: 'from-green-500 to-green-600',
      demo: (
        <div className="space-y-3">
          {[
            { name: 'Jean Baptiste Uwimana', program: 'Computer Science', status: 'Active' },
            { name: 'Marie Claire Mukamana', program: 'Business Admin', status: 'Active' },
            { name: 'Emmanuel Nkurunziza', program: 'Engineering', status: 'Graduated' }
          ].map((student, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
            >
              <div>
                <div className="font-medium text-gray-900">{student.name}</div>
                <div className="text-sm text-gray-600">{student.program}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                student.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {student.status}
              </span>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'finance',
      title: 'Financial Management',
      description: 'Handle fees, budgets, and accounting in RWF',
      icon: faDollarSign,
      color: 'from-purple-500 to-purple-600',
      demo: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-100 rounded-lg p-3">
              <div className="text-lg font-bold text-green-800">81.2%</div>
              <div className="text-xs text-green-600">Collection Rate</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <div className="text-lg font-bold text-yellow-800">45M</div>
              <div className="text-xs text-yellow-600">Outstanding</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-800">192M</div>
              <div className="text-xs text-blue-600">Collected</div>
            </div>
          </div>
          <motion.div
            animate={{ height: ['40px', '60px', '50px', '70px'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-t from-green-500 to-green-400 rounded-lg flex items-end justify-center text-white font-medium"
          >
            RWF Revenue Trend
          </motion.div>
        </div>
      )
    },
    {
      id: 'academic',
      title: 'Academic Performance',
      description: 'Monitor grades, courses, and achievements',
      icon: faGraduationCap,
      color: 'from-orange-500 to-orange-600',
      demo: (
        <div className="space-y-4">
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 mx-auto mb-4 relative"
            >
              <div className="w-full h-full rounded-full border-8 border-gray-200"></div>
              <div className="absolute inset-0 w-full h-full rounded-full border-8 border-orange-500 border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">94.5%</span>
              </div>
            </motion.div>
            <div className="text-sm text-gray-600">Overall Performance</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded">Mathematics: 78.5%</div>
            <div className="bg-green-50 p-2 rounded">Sciences: 82.1%</div>
            <div className="bg-purple-50 p-2 rounded">Languages: 85.3%</div>
            <div className="bg-orange-50 p-2 rounded">Arts: 88.2%</div>
          </div>
        </div>
      )
    }
  ];

  const handleFeatureClick = (featureId: string) => {
    setActiveFeature(activeFeature === featureId ? null : featureId);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Interactive System Demo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore the key features of INES-Ruhengeri ERP system with our interactive demonstrations.
          </p>
          
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isPlaying ? <FontAwesomeIcon icon={faPause} className="w-4 h-4 mr-2" /> : <FontAwesomeIcon icon={faPlay} className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Pause Demo' : 'Start Auto Demo'}
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Feature Selection */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    activeFeature === feature.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleFeatureClick(feature.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                        <FontAwesomeIcon icon={feature.icon} className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {feature.description}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: activeFeature === feature.id ? 45 : 0 }}
                        className="text-gray-400"
                      >
                        {activeFeature === feature.id ? <FontAwesomeIcon icon={faTimes} className="w-5 h-5" /> : <FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5" />}
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Demo Display */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-96 overflow-hidden">
              <CardContent className="p-6 h-full">
                <AnimatePresence mode="wait">
                  {activeFeature ? (
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="h-full"
                    >
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {features.find(f => f.id === activeFeature)?.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {features.find(f => f.id === activeFeature)?.description}
                        </p>
                      </div>
                      <div className="h-64">
                        {features.find(f => f.id === activeFeature)?.demo}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex items-center justify-center text-center"
                    >
                      <div>
                        <FontAwesomeIcon icon={faCalendar} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-2">
                          Select a Feature
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Click on any feature to see it in action
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
