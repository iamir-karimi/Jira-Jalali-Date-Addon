(function () {
    'use strict';

    var VERSION = '1.1.5';
    var JALALI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    var JALALI_WEEKDAYS = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
    var GREGORIAN_MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var GREGORIAN_MONTH_LOOKUP = {
        jan:1, january:1, feb:2, february:2, mar:3, march:3, apr:4, april:4, may:5,
        jun:6, june:6, jul:7, july:7, aug:8, august:8, sep:9, sept:9, september:9,
        oct:10, october:10, nov:11, november:11, dec:12, december:12
    };

    function div(a,b){ return ~~(a/b); }
    function mod(a,b){ return a - ~~(a/b) * b; }

    function jalCal(jy){
        var breaks=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
        var bl=breaks.length, gy=jy+621, leapJ=-14, jp=breaks[0], jm, jump, leap, n, i;
        if(jy<jp || jy>=breaks[bl-1]){ return {leap:0, gy:gy, march:20}; }
        for(i=1;i<bl;i+=1){
            jm=breaks[i]; jump=jm-jp;
            if(jy<jm){ break; }
            leapJ = leapJ + div(jump,33)*8 + div(mod(jump,33),4);
            jp=jm;
        }
        n=jy-jp;
        leapJ = leapJ + div(n,33)*8 + div(mod(n,33)+3,4);
        if(mod(jump,33)===4 && jump-n===4){ leapJ += 1; }
        var leapG = div(gy,4) - div((div(gy,100)+1)*3,4) - 150;
        var march = 20 + leapJ - leapG;
        if(jump-n<6){ n = n - jump + div(jump+4,33)*33; }
        leap = mod(mod(n+1,33)-1,4);
        if(leap===-1){ leap=4; }
        return {leap:leap, gy:gy, march:march};
    }

    function isLeapJalaliYear(jy){ return jalCal(jy).leap === 0; }
    function g2d(gy,gm,gd){
        var d = div((gy + div(gm-8,6) + 100100) * 1461, 4) + div(153 * mod(gm+9,12) + 2,5) + gd - 34840408;
        return d - div(div(gy + 100100 + div(gm-8,6),100) * 3,4) + 752;
    }
    function d2g(jdn){
        var j = 4*jdn + 139361631;
        j = j + div(div(4*jdn + 183187720,146097)*3,4)*4 - 3908;
        var i = div(mod(j,1461),4)*5 + 308;
        var gd = div(mod(i,153),5) + 1;
        var gm = mod(div(i,153),12) + 1;
        var gy = div(j,1461) - 100100 + div(8-gm,6);
        return {gy:gy, gm:gm, gd:gd};
    }
    function j2d(jy,jm,jd){
        var r = jalCal(jy);
        return g2d(r.gy,3,r.march) + (jm-1)*31 - div(jm,7)*(jm-7) + jd - 1;
    }
    function d2j(jdn){
        var gy = d2g(jdn).gy;
        var jy = gy - 621;
        var r = jalCal(jy);
        var jdn1f = g2d(gy,3,r.march);
        var k = jdn - jdn1f;
        var jm, jd;
        if(k>=0){
            if(k<=185){ jm = 1 + div(k,31); jd = mod(k,31) + 1; return {jy:jy, jm:jm, jd:jd}; }
            k -= 186;
        } else {
            jy -= 1;
            k += 179;
            if(r.leap===1){ k += 1; }
        }
        jm = 7 + div(k,30);
        jd = mod(k,30) + 1;
        return {jy:jy, jm:jm, jd:jd};
    }
    function toGregorian(jy,jm,jd){ return d2g(j2d(jy,jm,jd)); }
    function toJalali(gy,gm,gd){ return d2j(g2d(gy,gm,gd)); }
    function jalaliMonthLength(jy,jm){ if(jm<=6){ return 31; } if(jm<=11){ return 30; } return isLeapJalaliYear(jy) ? 30 : 29; }

    function normalizeDigits(value){
        var fa='۰۱۲۳۴۵۶۷۸۹', ar='٠١٢٣٤٥٦٧٨٩';
        return String(value || '').replace(/[۰-۹]/g,function(d){ return fa.indexOf(d); }).replace(/[٠-٩]/g,function(d){ return ar.indexOf(d); });
    }
    function toPersianDigits(value){ var map=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹']; return String(value).replace(/\d/g,function(d){ return map[d]; }); }
    function pad(num){ return String(num).padStart(2,'0'); }
    function formatJalaliSlash(jy,jm,jd){ return toPersianDigits(jy + '/' + pad(jm) + '/' + pad(jd)); }
    function formatJalaliLong(jy,jm,jd){ return toPersianDigits(jd) + ' ' + JALALI_MONTHS[jm-1] + ' ' + toPersianDigits(jy); }
    function formatGregorianForJira(gy,gm,gd){ return gd + '/' + GREGORIAN_MONTHS_SHORT[gm-1] + '/' + gy; }
    function formatGregorianForJiraShortYear(gy,gm,gd){ return gd + '/' + GREGORIAN_MONTHS_SHORT[gm-1] + '/' + String(gy).slice(-2); }

    function isWorklogDateTimeInput(input){
        var hint = ((input.id || '') + ' ' + (input.name || '') + ' ' + (input.className || '') + ' ' + closestLabelText(input)).toLowerCase();
        return hint.indexOf('date started') !== -1 || hint.indexOf('work occurred') !== -1 || hint.indexOf('worklog') !== -1 || hint.indexOf('started') !== -1;
    }

    function extractTimeParts(value){
        var m = String(value || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
        if(m){
            var hour = parseInt(m[1], 10);
            var minute = parseInt(m[2], 10);
            var meridiem = m[3] ? String(m[3]).toUpperCase() : null;
            if(!meridiem){
                meridiem = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12;
                if(hour === 0){ hour = 12; }
            }
            return {hour: hour, minute: minute, meridiem: meridiem};
        }
        var now = new Date();
        var h = now.getHours();
        var md = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if(h === 0){ h = 12; }
        return {hour: h, minute: now.getMinutes(), meridiem: md};
    }

    function formatGregorianForOriginalInput(gy,gm,gd,input){
        if(isWorklogDateTimeInput(input)){
            var t = extractTimeParts(input.value);
            return formatGregorianForJiraShortYear(gy, gm, gd) + ' ' + t.hour + ':' + pad(t.minute) + ' ' + t.meridiem;
        }
        return formatGregorianForJira(gy, gm, gd);
    }

    function parseJalaliInput(value){
        var clean = normalizeDigits(value).trim();
        var match = clean.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
        if(!match){ return null; }
        var jy=parseInt(match[1],10), jm=parseInt(match[2],10), jd=parseInt(match[3],10);
        if(jy<1200 || jy>1700 || jm<1 || jm>12 || jd<1 || jd>jalaliMonthLength(jy,jm)){ return null; }
        return {jy:jy, jm:jm, jd:jd};
    }

    function normalizeYear(yearText){
        var year = parseInt(yearText, 10);
        if(year < 100){ return 2000 + year; }
        return year;
    }

    function parseGregorianJiraValue(value){
        if(!value){ return null; }
        var clean = String(value).trim(), m;
        m = clean.match(/^(\d{1,2})\/([A-Za-z]{3,9})\/(\d{2}|\d{4})$/);
        if(m){
            var gd=parseInt(m[1],10), mon=m[2].substr(0,3).toLowerCase(), gy=normalizeYear(m[3]);
            if(GREGORIAN_MONTH_LOOKUP[mon]){ return toJalali(gy, GREGORIAN_MONTH_LOOKUP[mon], gd); }
        }
        m = clean.match(/^(\d{2}|\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
        if(m){ return toJalali(normalizeYear(m[1]), parseInt(m[2],10), parseInt(m[3],10)); }
        return null;
    }

    function parseVisibleGregorianDateText(text){
        if(!text){ return null; }
        var clean = String(text).trim();
        var m = clean.match(/\b(\d{1,2})\/([A-Za-z]{3,9})\/(\d{2}|\d{4})\b/);
        if(m){
            var mon = m[2].substr(0,3).toLowerCase();
            if(GREGORIAN_MONTH_LOOKUP[mon]){ return {match:m[0], j:toJalali(normalizeYear(m[3]), GREGORIAN_MONTH_LOOKUP[mon], parseInt(m[1],10))}; }
        }
        m = clean.match(/\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{2}|\d{4})\b/);
        if(m){
            var mon2 = m[1].substr(0,3).toLowerCase();
            if(GREGORIAN_MONTH_LOOKUP[mon2]){ return {match:m[0], j:toJalali(normalizeYear(m[3]), GREGORIAN_MONTH_LOOKUP[mon2], parseInt(m[2],10))}; }
        }
        m = clean.match(/\b(\d{2}|\d{4})[-\/](\d{1,2})[-\/](\d{1,2})\b/);
        if(m){ return {match:m[0], j:toJalali(normalizeYear(m[1]), parseInt(m[2],10), parseInt(m[3],10))}; }
        return null;
    }

    function formatTimeFa(timeText, meridiem){
        if(!timeText){ return ''; }
        var parts = String(timeText).split(':');
        var h = parseInt(parts[0], 10);
        var m = parseInt(parts[1] || '0', 10);
        if(meridiem){
            var md = String(meridiem).toLowerCase();
            if(md === 'pm' && h < 12){ h += 12; }
            if(md === 'am' && h === 12){ h = 0; }
        }
        return toPersianDigits(pad(h) + ':' + pad(m));
    }

    function convertRelativeVisibleText(text){
        var result = String(text || '');
        result = result.replace(/\bYesterday\b(?:\s+(\d{1,2}:\d{2})\s*(AM|PM)?)?/gi, function(match, time, md){
            return time ? ('دیروز ' + formatTimeFa(time, md)) : 'دیروز';
        });
        result = result.replace(/\bToday\b(?:\s+(\d{1,2}:\d{2})\s*(AM|PM)?)?/gi, function(match, time, md){
            return time ? ('امروز ' + formatTimeFa(time, md)) : 'امروز';
        });
        result = result.replace(/\b(\d+)\s+minutes?\s+ago\b/gi, function(match, n){ return toPersianDigits(n) + ' دقیقه پیش'; });
        result = result.replace(/\b(\d+)\s+hours?\s+ago\b/gi, function(match, n){ return toPersianDigits(n) + ' ساعت پیش'; });
        result = result.replace(/\b(\d+)\s+days?\s+ago\b/gi, function(match, n){ return toPersianDigits(n) + ' روز پیش'; });
        result = result.replace(/\bends\b/gi, 'اتمام');
        return result;
    }

    function triggerInputEvents(input){
        ['input','change','blur'].forEach(function(name){
            try { input.dispatchEvent(new Event(name,{bubbles:true})); }
            catch(e){ var event=document.createEvent('HTMLEvents'); event.initEvent(name,true,false); input.dispatchEvent(event); }
        });
        if(window.AJS && window.AJS.$){ try { window.AJS.$(input).trigger('change').trigger('blur'); } catch(e2){} }
    }

    function hasPersian(text){ return /[\u0600-\u06FF]/.test(text || ''); }
    function applyRtlTextClasses(root){
        var scope = root || document;
        // Keep Jira chrome, details tables, labels and sidebar LTR. RTL only user-entered Persian content.
        var selectors = '.user-content-block, .wiki-content, .activity-comment .action-body, .activity-comment .action-body p, .issue-body-content .user-content-block, .issue-body-content .wiki-content, .ghx-summary, .ghx-description, h1#summary-val, #summary-val, .editable-field.inactive';
        scope.querySelectorAll(selectors).forEach(function(el){
            if(!el || (el.dataset && el.dataset.fmaRtlChecked === '1')){ return; }
            if(el.closest && (el.closest('.fma-jalali-field-wrap') || el.closest('.fma-jdp') || el.closest('.issue-data-block') || el.closest('.item-details') || el.closest('.datesmodule'))){ return; }
            var text = (el.textContent || '').trim();
            if(text && hasPersian(text)){ el.classList.add('fma-rtl-text'); }
            if(el.dataset){ el.dataset.fmaRtlChecked = '1'; }
        });
    }

    function closestLabelText(input){
        var text='';
        var fieldGroup = input.closest ? input.closest('.field-group, .aui-field, .fieldArea, .field-group-container, .field-value, .datesmodule') : null;
        if(fieldGroup){ text += ' ' + (fieldGroup.textContent || ''); }
        if(input.id){
            var label = document.querySelector('label[for="' + input.id.replace(/"/g,'\\"') + '"]');
            if(label){ text += ' ' + (label.textContent || ''); }
        }
        return text;
    }

    function isProbablyJiraDateInput(input){
        if(!input || input.nodeType!==1 || input.tagName.toLowerCase() !== 'input'){ return false; }
        if(input.classList.contains('fma-jalali-input') || input.classList.contains('fma-jalali-original-input')){ return false; }
        if(input.closest && input.closest('.fma-jalali-field-wrap')){ return false; }
        var type = (input.getAttribute('type') || 'text').toLowerCase();
        if(['hidden','checkbox','radio','submit','button','file','password'].indexOf(type)!==-1){ return false; }
        if(input.dataset && input.dataset.fmaJalaliBound === '1'){ return false; }
        var id=input.id || '', name=input.name || '', cls=input.className || '', title=input.getAttribute('title') || '', aria=input.getAttribute('aria-label') || '', placeholder=input.getAttribute('placeholder') || '';
        var labelText = closestLabelText(input);
        var hint = (id + ' ' + name + ' ' + cls + ' ' + title + ' ' + aria + ' ' + placeholder + ' ' + labelText).toLowerCase();
        if(/estimate|remaining|original estimate|time tracking|log work|worklog|search|summary|description|comment|assignee|reporter|label|sprint/.test(hint)){ return false; }
        if(id === 'duedate' || name === 'duedate'){ return true; }
        if(/\bhasdatepicker\b|\bdatepicker\b|date-picker|aui-date-picker/.test(hint)){ return true; }
        if(/customfield_\d+/.test(id + ' ' + name) && /date|تاریخ/.test(hint)){ return true; }
        if(/due date|start date|end date|target date|تاریخ/.test(hint)){ return true; }
        return false;
    }

    function closeAllPickers(except){
        document.querySelectorAll('.fma-jdp').forEach(function(picker){ if(picker !== except && picker.parentNode){ picker.parentNode.removeChild(picker); } });
    }

    function buildPicker(state,onSelect){
        var picker=document.createElement('div'); picker.className='fma-jdp';
        var header=document.createElement('div'); header.className='fma-jdp-header';
        var prev=document.createElement('button'); prev.type='button'; prev.className='fma-jdp-nav'; prev.textContent='‹'; prev.title='ماه قبل';
        var next=document.createElement('button'); next.type='button'; next.className='fma-jdp-nav'; next.textContent='›'; next.title='ماه بعد';
        var monthSelect=document.createElement('select'); monthSelect.className='fma-jdp-select fma-jdp-month';
        JALALI_MONTHS.forEach(function(name,index){ var opt=document.createElement('option'); opt.value=String(index+1); opt.textContent=name; monthSelect.appendChild(opt); });
        var yearSelect=document.createElement('select'); yearSelect.className='fma-jdp-select fma-jdp-year';
        header.appendChild(prev); header.appendChild(monthSelect); header.appendChild(yearSelect); header.appendChild(next);
        var weekdays=document.createElement('div'); weekdays.className='fma-jdp-weekdays';
        JALALI_WEEKDAYS.forEach(function(day){ var item=document.createElement('div'); item.className='fma-jdp-weekday'; item.textContent=day; weekdays.appendChild(item); });
        var days=document.createElement('div'); days.className='fma-jdp-days';
        var footer=document.createElement('div'); footer.className='fma-jdp-footer';
        var todayBtn=document.createElement('button'); todayBtn.type='button'; todayBtn.className='fma-jdp-btn'; todayBtn.textContent='امروز';
        var clearBtn=document.createElement('button'); clearBtn.type='button'; clearBtn.className='fma-jdp-btn'; clearBtn.textContent='پاک کردن';
        footer.appendChild(todayBtn); footer.appendChild(clearBtn);
        picker.appendChild(header); picker.appendChild(weekdays); picker.appendChild(days); picker.appendChild(footer);

        function rebuildYearOptions(){
            var selected=state.jy; yearSelect.innerHTML='';
            for(var y=selected-12; y<=selected+12; y+=1){ var opt=document.createElement('option'); opt.value=String(y); opt.textContent=toPersianDigits(y); yearSelect.appendChild(opt); }
        }
        function render(){
            rebuildYearOptions(); monthSelect.value=String(state.jm); yearSelect.value=String(state.jy); days.innerHTML='';
            var firstG=toGregorian(state.jy,state.jm,1);
            var firstDate=new Date(firstG.gy, firstG.gm-1, firstG.gd);
            var startOffset=(firstDate.getDay()+1)%7;
            var monthLength=jalaliMonthLength(state.jy,state.jm);
            var now=new Date(); var todayJ=toJalali(now.getFullYear(), now.getMonth()+1, now.getDate());
            for(var i=0;i<startOffset;i+=1){ var empty=document.createElement('button'); empty.type='button'; empty.className='fma-jdp-day is-empty'; empty.tabIndex=-1; days.appendChild(empty); }
            for(var d=1; d<=monthLength; d+=1){
                var btn=document.createElement('button'); btn.type='button'; btn.className='fma-jdp-day'; btn.textContent=toPersianDigits(d);
                if(state.selected && state.selected.jy===state.jy && state.selected.jm===state.jm && state.selected.jd===d){ btn.classList.add('is-selected'); }
                if(todayJ.jy===state.jy && todayJ.jm===state.jm && todayJ.jd===d){ btn.classList.add('is-today'); }
                (function(day){
                    btn.addEventListener('mousedown', function(event){ event.preventDefault(); event.stopPropagation(); state.selected={jy:state.jy,jm:state.jm,jd:day}; onSelect(state.selected); closeAllPickers(); });
                    btn.addEventListener('click', function(event){ event.preventDefault(); event.stopPropagation(); });
                })(d);
                days.appendChild(btn);
            }
        }
        prev.addEventListener('mousedown',function(e){ e.preventDefault(); state.jm-=1; if(state.jm<1){ state.jm=12; state.jy-=1; } render(); });
        next.addEventListener('mousedown',function(e){ e.preventDefault(); state.jm+=1; if(state.jm>12){ state.jm=1; state.jy+=1; } render(); });
        monthSelect.addEventListener('change',function(){ state.jm=parseInt(monthSelect.value,10); render(); });
        yearSelect.addEventListener('change',function(){ state.jy=parseInt(yearSelect.value,10); render(); });
        todayBtn.addEventListener('mousedown',function(e){ e.preventDefault(); var today=new Date(); var j=toJalali(today.getFullYear(), today.getMonth()+1, today.getDate()); state.jy=j.jy; state.jm=j.jm; state.selected={jy:j.jy,jm:j.jm,jd:j.jd}; onSelect(state.selected); closeAllPickers(); });
        clearBtn.addEventListener('mousedown',function(e){ e.preventDefault(); onSelect(null); closeAllPickers(); });
        render(); return picker;
    }

    function bindDateInput(originalInput){
        if(!isProbablyJiraDateInput(originalInput)){ return; }
        originalInput.dataset.fmaJalaliBound='1'; originalInput.classList.add('fma-jalali-original-input'); originalInput.setAttribute('autocomplete','off');
        try { if(window.jQuery && window.jQuery.fn && window.jQuery.fn.datepicker){ window.jQuery(originalInput).datepicker('destroy'); } } catch(e){}
        if(originalInput.nextElementSibling && originalInput.nextElementSibling.classList && originalInput.nextElementSibling.classList.contains('fma-jalali-field-wrap')){ return; }
        var wrapper=document.createElement('span'); wrapper.className='fma-jalali-field-wrap';
        var display=document.createElement('input'); display.type='text'; display.className='fma-jalali-input'; display.autocomplete='off'; display.placeholder='مثلاً ۱۴۰۵/۰۳/۲۱';
        var preview=document.createElement('div'); preview.className='fma-jalali-preview'; preview.textContent='یک تاریخ شمسی انتخاب کنید';
        originalInput.parentNode.insertBefore(wrapper, originalInput.nextSibling); wrapper.appendChild(display); wrapper.appendChild(preview);
        function setDate(jDate){
            if(!jDate){ originalInput.value=''; display.value=''; preview.textContent='یک تاریخ شمسی انتخاب کنید'; triggerInputEvents(originalInput); return; }
            var g=toGregorian(jDate.jy,jDate.jm,jDate.jd);
            originalInput.value=formatGregorianForOriginalInput(g.gy,g.gm,g.gd,originalInput);
            display.value=formatJalaliSlash(jDate.jy,jDate.jm,jDate.jd);
            preview.textContent='تاریخ انتخابی: ' + formatJalaliLong(jDate.jy,jDate.jm,jDate.jd);
            triggerInputEvents(originalInput);
        }
        function openPicker(){
            closeAllPickers();
            var selected=parseJalaliInput(display.value) || parseGregorianJiraValue(originalInput.value);
            var base=selected;
            if(!base){ var now=new Date(); base=toJalali(now.getFullYear(), now.getMonth()+1, now.getDate()); }
            var picker=buildPicker({jy:base.jy,jm:base.jm,selected:selected}, setDate);
            wrapper.appendChild(picker);
        }
        display.addEventListener('focus', openPicker); display.addEventListener('click', openPicker);
        display.addEventListener('change', function(){ var parsed=parseJalaliInput(display.value); if(parsed){ setDate(parsed); } });
        display.addEventListener('keydown', function(event){ if(event.key==='ArrowDown'){ event.preventDefault(); openPicker(); } });
        var initial=parseGregorianJiraValue(originalInput.value); if(initial){ display.value=formatJalaliSlash(initial.jy,initial.jm,initial.jd); preview.textContent='تاریخ انتخابی: ' + formatJalaliLong(initial.jy,initial.jm,initial.jd); }
    }

    function convertVisibleDateNodes(){
        var selectors=['time','.datesmodule dd','.datesmodule span','.issue-data-block dd','.property-list dd','.item-details dl dd','.activity-comment time','.activity-comment span','.mod-content dd','.ghx-days-remaining','span','td','dd','a'];
        selectors.forEach(function(selector){
            document.querySelectorAll(selector).forEach(function(el){
                if(!el || el.dataset.fmaJalaliText==='1' || el.closest('.fma-jalali-field-wrap') || el.closest('.fma-jdp')){ return; }
                if(el.children && el.children.length>0){ return; }
                var original=(el.textContent || '').trim();
                if(!original || original.length>120 || /[۰-۹]/.test(original)){ return; }
                var converted = original;
                var parsed=parseVisibleGregorianDateText(original);
                if(parsed && parsed.j){ converted=converted.replace(parsed.match, formatJalaliLong(parsed.j.jy, parsed.j.jm, parsed.j.jd)); }
                converted = convertRelativeVisibleText(converted);
                if(converted !== original){
                    el.textContent=converted;
                    el.dataset.fmaJalaliText='1';
                    el.classList.add('fma-rtl-text');
                }
            });
        });
    }

    function scan(){ document.body.classList.add('fma-jalali-enabled'); document.querySelectorAll('input').forEach(bindDateInput); convertVisibleDateNodes(); applyRtlTextClasses(document); }
    function setupGlobalHandlers(){
        document.addEventListener('mousedown',function(event){ var target=event.target; if(!target.closest || (!target.closest('.fma-jdp') && !target.closest('.fma-jalali-field-wrap'))){ closeAllPickers(); } });
        document.addEventListener('keydown',function(event){ if(event.key==='Escape'){ closeAllPickers(); } });
    }
    function startObserver(){ var timer=null; var observer=new MutationObserver(function(){ window.clearTimeout(timer); timer=window.setTimeout(scan,250); }); observer.observe(document.body,{childList:true,subtree:true}); }
    function init(){ scan(); setupGlobalHandlers(); startObserver(); if(window.JIRA && window.JIRA.Events && window.AJS && window.AJS.$){ try { window.AJS.$(document).bind(window.JIRA.Events.NEW_CONTENT_ADDED,function(){ window.setTimeout(scan,100); }); } catch(e){} } console.log('[FMA Jalali] Persian Jira date picker loaded v' + VERSION + '.'); }
    if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
})();
