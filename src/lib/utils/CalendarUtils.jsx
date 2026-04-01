import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendType = "positive",
  color = "blue",
  subtitle 
}) {
  const colorClasses = {
    blue: {
      icon: "bg-blue-500",
      gradient: "from-blue-50 to-blue-100",
      text: "text-blue-600"
    },
    green: {
      icon: "bg-green-500", 
      gradient: "from-green-50 to-green-100",
      text: "text-green-600"
    },
    amber: {
      icon: "bg-amber-500",
      gradient: "from-amber-50 to-amber-100", 
      text: "text-amber-600"
    },
    red: {
      icon: "bg-red-500",
      gradient: "from-red-50 to-red-100",
      text: "text-red-600"
    }
  };

  const currentColor = colorClasses[color];

  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${currentColor.gradient} opacity-50`} />
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-3">
                {trendType === "positive" ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  trendType === "positive" ? "text-green-600" : "text-red-600"
                }`}>
                  {trend}
                </span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-2xl ${currentColor.icon} bg-opacity-15`}>
            <Icon className={`w-8 h-8 ${currentColor.text}`} />
          </div>
        </div>
      </div>
    </Card>
  );
}