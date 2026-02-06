import React, { useEffect, useRef } from 'react';
import { View, Canvas } from '@tarojs/components';
import Taro, { useReady } from '@tarojs/taro';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

// Ensure CanvasRenderer is registered
echarts.use([CanvasRenderer]);

// FIX: Configure Platform API for WeChat Mini Program
// ECharts needs a way to create a temporary canvas for text measurement (axis labels, etc.)
echarts.setPlatformAPI({
  createCanvas: () => {
    // Try using Taro's offscreen canvas
    try {
      // @ts-ignore
      return Taro.createOffscreenCanvas({ type: '2d', width: 32, height: 32 });
    } catch (e) {
      // Fallback mock if offscreen canvas fails
      return {
        getContext: () => ({
           measureText: (text: string) => ({ width: (text || '').length * 10 })
        })
      } as any;
    }
  },
});

interface EChartProps {
  echarts: any; // The echarts instance
  option: any;
  style?: React.CSSProperties;
}

export const EChart: React.FC<EChartProps> = ({ echarts: echartsLib, option, style }) => {
  const chartRef = useRef<any>(null);
  const canvasId = useRef(`echarts-${Math.random().toString(36).slice(2)}`).current;
  const isInit = useRef(false);

  useReady(() => {
    // Delay to ensure canvas node is available
    setTimeout(() => {
        initChart();
    }, 200);
  });

  useEffect(() => {
    if (chartRef.current && isInit.current) {
      if (!option) return;
      try {
        chartRef.current.setOption(option);
      } catch (e) {
        console.error('[ECharts] setOption Error', e);
      }
    }
  }, [option]);

  const initChart = () => {
    try {
        const query = Taro.createSelectorQuery();
        query
        .select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
            try {
                const canvasNode = res[0]?.node;
                const width = res[0]?.width;
                const height = res[0]?.height;

                if (canvasNode) {
                    const dpr = Taro.getSystemInfoSync().pixelRatio;
                    
                    // Physical pixels
                    canvasNode.width = width * dpr;
                    canvasNode.height = height * dpr;

                    // COMPATIBILITY FIX: ECharts expects these methods
                    if (!canvasNode.addEventListener) {
                        canvasNode.addEventListener = (type, listener) => {};
                        canvasNode.removeEventListener = (type, listener) => {};
                    }
                    
                    // Init ECharts
                    const chart = echartsLib.init(canvasNode, null, {
                        renderer: 'canvas',
                        width,
                        height,
                        devicePixelRatio: dpr
                    });
                    
                    if (option) {
                        chart.setOption(option);
                    }

                    chartRef.current = chart;
                    isInit.current = true;
                    // console.log('[ECharts] Initialization Success 🚀');
                } else {
                    console.error('[ECharts] Canvas Node NOT Found', res);
                }
            } catch (innerErr) {
                console.error('[ECharts] CRITICAL ERROR inside exec:', innerErr);
            }
        });
    } catch (err) {
        console.error('[ECharts] Init Critical Error', err);
    }
  };

  return (
    <View style={style}>
      <Canvas 
        type="2d" 
        id={canvasId} 
        style={{ width: '100%', height: '100%' }}
        onTouchStart={(e) => {
          if (chartRef.current && e.touches.length > 0) {
            const touch = e.touches[0];
            const handler = chartRef.current.getZr().handler;
            handler.dispatch('mousedown', {
              zrX: touch.x,
              zrY: touch.y
            });
            handler.dispatch('mousemove', {
              zrX: touch.x,
              zrY: touch.y
            });
            handler.processGesture(wrapTouch(e), 'start');
          }
        }}
        onTouchMove={(e) => {
          if (chartRef.current && e.touches.length > 0) {
            const touch = e.touches[0];
            const handler = chartRef.current.getZr().handler;
            handler.dispatch('mousemove', {
              zrX: touch.x,
              zrY: touch.y
            });
            handler.processGesture(wrapTouch(e), 'change');
          }
        }}
        onTouchEnd={(e) => {
          if (chartRef.current) {
            const handler = chartRef.current.getZr().handler;
            handler.dispatch('mouseup', {});
            handler.dispatch('click', {});
            handler.processGesture(wrapTouch(e), 'end');
          }
        }}
      />
    </View>
  );
};

function wrapTouch(event) {
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touch.offsetX = touch.x;
    touch.offsetY = touch.y;
  }
  return event;
}
