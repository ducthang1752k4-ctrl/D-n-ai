import { Component, ElementRef, ViewChild, AfterViewInit, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../services/gemini.service';
import { UserProgressService } from '../services/user-progress.service';

declare const d3: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 md:p-10 max-w-7xl mx-auto space-y-8 h-full overflow-y-auto bg-[#F9FAFB]">
      <header class="mb-4 flex flex-col md:flex-row justify-between items-end fade-in-scale" style="animation-delay: 0ms">
        <div>
          <h1 class="text-[36px] leading-tight font-bold text-[#4B5EAA] tracking-tight font-display">Learning Analytics</h1>
          <p class="text-[#64748B] mt-2 text-lg font-light italic">Your personalized growth in a glance.</p>
        </div>
        <div class="mt-4 md:mt-0 flex flex-col items-end">
           <span class="text-xs font-bold text-[#A7C7E7] uppercase tracking-widest mb-1">Current Level</span>
           <div class="px-6 py-2 bg-[#D4C4FB] text-[#4B5EAA] rounded-full text-lg font-bold shadow-sm border border-[#F3E8FF]">
             {{ progressService.getOverallLevel() }}
           </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Main Radar Chart (Peach Mint Serenity - Peach Cream BG) -->
        <div class="lg:col-span-2 bg-[#FFFCF2] p-8 rounded-[36px] fade-in-scale relative overflow-hidden shadow-sm border border-[#FFDAC1]" style="animation-delay: 100ms">
          <div class="flex justify-between items-center mb-6 relative z-10">
             <h2 class="text-2xl font-bold text-[#4B5EAA] flex items-center gap-3 font-display">
               <span class="w-3 h-8 bg-[#FFDAC1] rounded-full"></span>
               Skill Breakdown
             </h2>
             <button class="text-sm text-[#4B5EAA] font-bold hover:bg-[#FFDAC1] px-5 py-2.5 rounded-full transition-colors border border-[#FFDAC1] bg-white">Detailed Report</button>
          </div>
          
          <div class="relative w-full h-[340px] flex justify-center items-center">
             <div #radarChart class="w-full h-full flex justify-center items-center relative z-10"></div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
           
           <!-- Trend Line Chart (Sky Blue + Butter Yellow Fresh - Sky Blue BG) -->
           <div class="bg-[#F0F9FF] p-8 rounded-[36px] fade-in-scale border border-[#A7C7E7]" style="animation-delay: 200ms">
              <h2 class="text-xl font-bold text-[#4B5EAA] mb-4 font-display">Focus Trend</h2>
              <div #lineChart class="w-full h-32"></div>
              <div class="mt-2 text-xs text-center text-[#4B5EAA] font-medium">Consistency over last 7 days</div>
           </div>

           <!-- Curriculum (Mint Breeze - Soft White/Green BG) -->
           <div class="bg-[#D9E8D8] p-8 rounded-[36px] fade-in-scale h-full text-[#4B5EAA] border border-[#B5EAD7]" style="animation-delay: 300ms">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold font-display">Daily Focus</h2>
                <span class="bg-[#A8E6CF] p-2 rounded-full shadow-sm text-[#4B5EAA]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                </span>
              </div>
              
              @if (loading()) {
                <div class="space-y-3">
                  <div class="h-20 bg-[#F9FAFB]/50 rounded-[24px] animate-pulse"></div>
                  <div class="h-20 bg-[#F9FAFB]/50 rounded-[24px] animate-pulse"></div>
                  <div class="h-20 bg-[#F9FAFB]/50 rounded-[24px] animate-pulse"></div>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (item of plan(); track $index) {
                    <div class="flex items-center p-4 bg-[#F9FAFB] hover:bg-white rounded-[28px] transition-all cursor-pointer shadow-sm border border-[#A8E6CF] hover:border-[#4B5EAA]">
                      <div class="h-10 w-10 rounded-full bg-[#FFE4E1] text-[#4B5EAA] flex items-center justify-center font-black mr-4 text-base shadow-sm font-display">
                        {{ $index + 1 }}
                      </div>
                      <div class="flex-1">
                        <h3 class="font-bold text-[#4B5EAA] text-sm leading-tight font-display">{{ item.title }}</h3>
                        <p class="text-xs text-[#64748B] mt-1">{{ item.duration }} • <span class="text-[#4B5EAA] font-bold">{{ item.focus }}</span></p>
                      </div>
                    </div>
                  }
                </div>
              }
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class DashboardComponent implements AfterViewInit, OnInit {
  @ViewChild('radarChart') radarChartRef!: ElementRef;
  @ViewChild('lineChart') lineChartRef!: ElementRef;
  
  geminiService = inject(GeminiService);
  progressService = inject(UserProgressService);
  
  plan = signal<any[]>([]);
  loading = signal(true);

  constructor() {
    effect(() => {
      const stats = this.progressService.stats();
      const history = this.progressService.history();
      setTimeout(() => {
        this.renderRadarChart(stats);
        this.renderLineChart(history);
      }, 0);
    });
  }

  async ngOnInit() {
    this.loading.set(true);
    try {
      const currentStats = this.progressService.stats();
      const data = await this.geminiService.generateCurriculum(currentStats);
      this.plan.set(data.plan);
    } catch (e) {
      console.error("Failed to generate curriculum", e);
      this.plan.set([
        { title: "Shadowing Warm-up", duration: "10 min", focus: "Intonation" },
        { title: "Difficult Vowels", duration: "15 min", focus: "Pronunciation" },
        { title: "Active Recall", duration: "5 min", focus: "Vocabulary" }
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  ngAfterViewInit() { }

  renderRadarChart(data: any[]) {
    if (!this.radarChartRef || typeof d3 === 'undefined') return;
    d3.select(this.radarChartRef.nativeElement).selectAll("*").remove();

    const width = 350;
    const height = 340;
    const margin = 50;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(this.radarChartRef.nativeElement)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const angleSlice = Math.PI * 2 / data.length;
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 100]);

    // Grid circles (Mint Breeze - Mint Green)
    const levels = 3;
    for(let level = 0; level < levels; level++) {
        const levelFactor = radius * ((level + 1) / levels);
        svg.selectAll(".levels")
           .data(data)
           .enter()
           .append("circle")
           .attr("r", levelFactor)
           .style("fill", "none")
           .style("stroke", "#B5EAD7") 
           .style("stroke-width", "1.5px")
           .style("stroke-dasharray", "4 4");
    }

    // Axes
    const axis = svg.selectAll(".axis")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "axis");

    axis.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d: any, i: number) => rScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d: any, i: number) => rScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
      .style("stroke", "#FFDAC1") // Peach
      .style("stroke-width", "2px");

    // Labels
    axis.append("text")
      .attr("class", "legend")
      .style("font-size", "13px")
      .style("font-weight", "700")
      .style("font-family", "Domine, serif")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d: any, i: number) => rScale(125) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d: any, i: number) => rScale(125) * Math.sin(angleSlice * i - Math.PI / 2))
      .text((d: any) => d.axis)
      .style("fill", "#64748B");

    // Radar Path (Lavender Dream)
    const radarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius((d: any) => rScale(d.value))
      .angle((d: any, i: number) => i * angleSlice);

    const path = svg.append("path")
      .datum(data)
      .attr("d", radarLine)
      .style("fill", "#D4C4FB")
      .style("fill-opacity", 0.5)
      .style("stroke", "#4B5EAA")
      .style("stroke-width", 3);

    path.attr("opacity", 0)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1);
      
    // Dots (Sky Blue)
    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("cx", (d: any, i: number) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d: any, i: number) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("r", 0)
      .style("fill", "#4B5EAA")
      .style("stroke", "#FFFFFF")
      .style("stroke-width", 3)
      .transition()
      .delay((d: any, i: number) => i * 150)
      .duration(600)
      .ease(d3.easeBackOut)
      .attr("r", 8);
  }

  renderLineChart(data: any[]) {
    if (!this.lineChartRef || typeof d3 === 'undefined') return;
    d3.select(this.lineChartRef.nativeElement).selectAll("*").remove();

    const width = this.lineChartRef.nativeElement.offsetWidth;
    const height = this.lineChartRef.nativeElement.offsetHeight;
    const margin = {top: 10, right: 10, bottom: 25, left: 25};

    const svg = d3.select(this.lineChartRef.nativeElement)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(data.map((d: any) => d.date))
      .range([0, width - margin.left - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.top - margin.bottom, 0]);

    const line = d3.line()
      .curve(d3.curveCatmullRom) 
      .x((d: any) => x(d.date))
      .y((d: any) => y(d.score));

    const area = d3.area()
      .curve(d3.curveCatmullRom)
      .x((d: any) => x(d.date))
      .y0(height - margin.top - margin.bottom)
      .y1((d: any) => y(d.score));

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "area-gradient-sky")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#A7C7E7") 
      .attr("stop-opacity", 0.4);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#A7C7E7")
      .attr("stop-opacity", 0);

    svg.append("path")
       .datum(data)
       .attr("d", area)
       .style("fill", "url(#area-gradient-sky)");

    svg.append("path")
      .datum(data)
      .attr("class", "chart-path")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", "#4B5EAA")
      .style("stroke-width", 3)
      .style("stroke-linecap", "round");

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(12))
      .select(".domain").remove();
      
    svg.selectAll(".tick text")
       .style("fill", "#64748B")
       .style("font-family", "Merriweather, serif")
       .style("font-weight", "bold")
       .style("font-size", "11px");
  }
}