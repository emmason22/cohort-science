(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 520;

  function whenVisible(element, callback) {
    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      callback();
    }, { threshold: .12 });
    observer.observe(element);
  }

  function connectCanvasChart(frame, chart, Chart) {
    let progress = 1;
    let previous;
    let changed = [];
    let highlightUntil = 0;
    let visible = false;
    let drawing = 0;
    const isLine = chart.config.type === 'line';

    const plugin = {
      id: 'cohortMotion',
      beforeUpdate(current) {
        const next = new Map();
        changed = [];
        current.data.datasets.forEach((dataset, datasetIndex) => {
          if (!current.isDatasetVisible(datasetIndex)) return;
          dataset.data.forEach((value, pointIndex) => {
            if (value == null || value === 0) return;
            const key = JSON.stringify([dataset.label, current.data.labels[pointIndex]]);
            next.set(key, value);
            if (previous && previous.get(key) !== value) changed.push([datasetIndex, pointIndex]);
          });
        });
        previous = next;
        if (!visible || !changed.length || reducedMotion.matches) {
          highlightUntil = 0;
          return;
        }
        highlightUntil = performance.now() + 710;
        if (!drawing) drawing = requestAnimationFrame(draw);
      },
      beforeDatasetsDraw(current) {
        if (!isLine || progress >= 1) return;
        const { ctx, chartArea: area } = current;
        ctx.save();
        ctx.beginPath();
        ctx.rect(area.left, area.top, area.width * progress, area.height);
        ctx.clip();
      },
      afterDatasetsDraw(current) {
        if (isLine && progress < 1) current.ctx.restore();
        const remaining = highlightUntil - performance.now();
        if (remaining <= 0 || reducedMotion.matches) return;
        const { ctx } = current;
        ctx.save();
        ctx.strokeStyle = '#007d92';
        ctx.globalAlpha = Math.min(.75, remaining / 520);
        ctx.lineWidth = 2;
        for (const [datasetIndex, pointIndex] of changed) {
          const mark = current.getDatasetMeta(datasetIndex).data[pointIndex];
          if (!mark || !Number.isFinite(mark.x) || !Number.isFinite(mark.y)) continue;
          if (isLine) {
            ctx.beginPath();
            ctx.arc(mark.x, mark.y, 6, 0, Math.PI * 2);
            ctx.stroke();
          } else if (Math.abs(mark.x - mark.base) >= 3) {
            ctx.strokeRect(Math.min(mark.x, mark.base), mark.y - mark.height / 2,
              Math.abs(mark.x - mark.base), mark.height);
          }
        }
        ctx.restore();
      }
    };

    function draw(now) {
      drawing = 0;
      chart.draw();
      if (now < highlightUntil && !reducedMotion.matches) drawing = requestAnimationFrame(draw);
    }

    Chart.register(plugin);
    chart.update('none');
    whenVisible(frame, () => {
      visible = true;
      if (reducedMotion.matches) return;
      if (!isLine) {
        chart.reset();
        chart.update();
        return;
      }
      const start = performance.now();
      progress = 0;
      const drawLine = (now) => {
        progress = reducedMotion.matches ? 1 : Math.min((now - start) / duration, 1);
        chart.draw();
        if (progress < 1) requestAnimationFrame(drawLine);
      };
      requestAnimationFrame(drawLine);
    });
  }

  const plotMarks = {
    bar: '.barlayer .trace',
    scatter: '.scatterlayer .trace',
    scattergl: '.scatterlayer .trace',
    choropleth: '.choroplethlayer .trace',
    sankey: '.sankey'
  };

  function animatePlotMarks(trace, type, entrance) {
    if (!entrance) {
      trace.animate([{ opacity: .55 }, { opacity: 1 }], { duration: 480, easing: 'ease-out' });
      return;
    }
    if (type === 'bar') {
      trace.querySelectorAll('.point path').forEach((bar) => {
        bar.style.transformBox = 'fill-box';
        bar.style.transformOrigin = 'center bottom';
        bar.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
          { duration, easing: 'ease-out' });
      });
    } else if (type === 'scatter') {
      trace.querySelectorAll('.js-line').forEach((line) => {
        const length = line.getTotalLength();
        if (!length) return;
        line.animate([
          { strokeDasharray: String(length), strokeDashoffset: length },
          { strokeDasharray: String(length), strokeDashoffset: 0 }
        ], { duration, easing: 'ease-out' });
      });
    } else {
      trace.animate([{ opacity: .2 }, { opacity: 1 }], { duration, easing: 'ease-out' });
    }
  }

  function connectPlot(frame, plot) {
    let visible = false;
    let previous = new Map();
    const render = (entrance = false) => {
      const next = new Map();
      const offsets = new Map();
      for (const trace of plot._fullData || []) {
        if (trace.visible === false || trace.visible === 'legendonly') continue;
        const type = trace.type;
        const selector = plotMarks[type];
        const offset = offsets.get(type) || 0;
        offsets.set(type, offset + 1);
        const mark = selector && plot.querySelectorAll(selector)[offset];
        const key = trace.name + ':' + trace.index;
        const data = JSON.stringify([trace.x, trace.y, trace.z, trace.locations, trace.link?.value, trace.node?.label]);
        if (mark?.animate && visible && !reducedMotion.matches && (entrance || previous.get(key) !== data)) {
          animatePlotMarks(mark, type, entrance);
        }
        next.set(key, data);
      }
      previous = next;
    };
    plot.on('plotly_afterplot', () => render());
    whenVisible(frame, () => {
      visible = true;
      render(true);
    });
  }

  window.connectOutcomeChart = (frame) => {
    const doc = frame.contentDocument;
    const Chart = frame.contentWindow?.Chart;
    const chart = Chart && Object.values(Chart.instances || {})[0];
    if (chart) {
      connectCanvasChart(frame, chart, Chart);
      return;
    }
    if (!doc?.body) return;
    const observePlot = () => {
      const plot = doc.querySelector('.js-plotly-plot');
      if (typeof plot?.on !== 'function' || !plot._fullData) return false;
      connectPlot(frame, plot);
      return true;
    };
    if (observePlot()) return;
    const observer = new MutationObserver(() => {
      if (observePlot()) observer.disconnect();
    });
    observer.observe(doc.body, { childList: true, subtree: true });
  };
})();
