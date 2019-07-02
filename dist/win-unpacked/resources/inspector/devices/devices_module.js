Devices.DevicesView=class extends UI.VBox{constructor(){super(true);this.registerRequiredCSS('devices/devicesView.css');this.contentElement.classList.add('devices-view');const hbox=this.contentElement.createChild('div','hbox devices-container');const sidebar=hbox.createChild('div','devices-sidebar');sidebar.createChild('div','devices-view-title').createTextChild(Common.UIString('Devices'));this._sidebarList=sidebar.createChild('div','devices-sidebar-list');this._discoveryView=new Devices.DevicesView.DiscoveryView();this._sidebarListSpacer=this._sidebarList.createChild('div','devices-sidebar-spacer');this._discoveryListItem=this._sidebarList.createChild('div','devices-sidebar-item');this._discoveryListItem.textContent=Common.UIString('Settings');this._discoveryListItem.addEventListener('click',this._selectSidebarListItem.bind(this,this._discoveryListItem,this._discoveryView));this._viewById=new Map();this._devices=[];this._listItemById=new Map();this._selectedListItem=null;this._visibleView=null;this._viewContainer=hbox.createChild('div','flex-auto vbox');const discoveryFooter=this.contentElement.createChild('div','devices-footer');this._deviceCountSpan=discoveryFooter.createChild('span');discoveryFooter.createChild('span').textContent=Common.UIString(' Read ');discoveryFooter.appendChild(UI.XLink.create('https://developers.google.com/chrome-developer-tools/docs/remote-debugging',Common.UIString('remote debugging documentation')));discoveryFooter.createChild('span').textContent=Common.UIString(' for more information.');this._updateFooter();this._selectSidebarListItem(this._discoveryListItem,this._discoveryView);InspectorFrontendHost.events.addEventListener(InspectorFrontendHostAPI.Events.DevicesUpdated,this._devicesUpdated,this);InspectorFrontendHost.events.addEventListener(InspectorFrontendHostAPI.Events.DevicesDiscoveryConfigChanged,this._devicesDiscoveryConfigChanged,this);InspectorFrontendHost.events.addEventListener(InspectorFrontendHostAPI.Events.DevicesPortForwardingStatusChanged,this._devicesPortForwardingStatusChanged,this);this.contentElement.tabIndex=0;this.setDefaultFocusedElement(this.contentElement);}
static _instance(){if(!Devices.DevicesView._instanceObject)
Devices.DevicesView._instanceObject=new Devices.DevicesView();return Devices.DevicesView._instanceObject;}
_selectSidebarListItem(listItem,view){if(this._selectedListItem===listItem)
return;if(this._selectedListItem){this._selectedListItem.classList.remove('selected');this._visibleView.detach();}
this._visibleView=view;this._selectedListItem=listItem;this._visibleView.show(this._viewContainer);this._selectedListItem.classList.add('selected');}
_devicesUpdated(event){this._devices=(event.data).slice().filter(d=>d.adbSerial.toUpperCase()!=='WEBRTC'&&d.adbSerial.toUpperCase()!=='LOCALHOST');for(const device of this._devices){if(!device.adbConnected)
device.adbModel=Common.UIString('Unknown');}
const ids=new Set();for(const device of this._devices)
ids.add(device.id);let selectedRemoved=false;for(const deviceId of this._viewById.keys()){if(!ids.has(deviceId)){const listItem=(this._listItemById.get(deviceId));this._listItemById.remove(deviceId);this._viewById.remove(deviceId);listItem.remove();if(listItem===this._selectedListItem)
selectedRemoved=true;}}
for(const device of this._devices){let view=this._viewById.get(device.id);let listItem=this._listItemById.get(device.id);if(!view){view=new Devices.DevicesView.DeviceView();this._viewById.set(device.id,view);listItem=this._createSidebarListItem(view);this._listItemById.set(device.id,listItem);this._sidebarList.insertBefore(listItem,this._sidebarListSpacer);}
listItem._title.textContent=device.adbModel;listItem._status.textContent=device.adbConnected?Common.UIString('Connected'):Common.UIString('Pending Authorization');listItem.classList.toggle('device-connected',device.adbConnected);view.update(device);}
if(selectedRemoved)
this._selectSidebarListItem(this._discoveryListItem,this._discoveryView);this._updateFooter();}
_createSidebarListItem(view){const listItem=createElementWithClass('div','devices-sidebar-item');listItem.addEventListener('click',this._selectSidebarListItem.bind(this,listItem,view));listItem._title=listItem.createChild('div','devices-sidebar-item-title');listItem._status=listItem.createChild('div','devices-sidebar-item-status');return listItem;}
_devicesDiscoveryConfigChanged(event){const config=(event.data);this._discoveryView.discoveryConfigChanged(config);}
_devicesPortForwardingStatusChanged(event){const status=(event.data);for(const deviceId in status){const view=this._viewById.get(deviceId);if(view)
view.portForwardingStatusChanged(status[deviceId]);}
for(const deviceId of this._viewById.keys()){const view=this._viewById.get(deviceId);if(view&&!(deviceId in status))
view.portForwardingStatusChanged({ports:{},browserId:''});}}
_updateFooter(){this._deviceCountSpan.textContent=!this._devices.length?Common.UIString('No devices detected.'):this._devices.length===1?Common.UIString('1 device detected.'):Common.UIString('%d devices detected.',this._devices.length);}
wasShown(){super.wasShown();InspectorFrontendHost.setDevicesUpdatesEnabled(true);}
willHide(){super.willHide();InspectorFrontendHost.setDevicesUpdatesEnabled(false);}};Devices.DevicesView.DiscoveryView=class extends UI.VBox{constructor(){super();this.setMinimumSize(100,100);this.element.classList.add('discovery-view');this.contentElement.createChild('div','hbox device-text-row').createChild('div','view-title').textContent=Common.UIString('Settings');const discoverUsbDevicesCheckbox=UI.CheckboxLabel.create(Common.UIString('Discover USB devices'));discoverUsbDevicesCheckbox.classList.add('usb-checkbox');this.element.appendChild(discoverUsbDevicesCheckbox);this._discoverUsbDevicesCheckbox=discoverUsbDevicesCheckbox.checkboxElement;this._discoverUsbDevicesCheckbox.addEventListener('click',()=>{this._config.discoverUsbDevices=this._discoverUsbDevicesCheckbox.checked;InspectorFrontendHost.setDevicesDiscoveryConfig(this._config);},false);const help=this.element.createChild('div','discovery-help');help.createChild('span').textContent=Common.UIString('Need help? Read Chrome ');help.appendChild(UI.XLink.create('https://developers.google.com/chrome-developer-tools/docs/remote-debugging',Common.UIString('remote debugging documentation.')));this._config;this._portForwardingView=new Devices.DevicesView.PortForwardingView((enabled,config)=>{this._config.portForwardingEnabled=enabled;this._config.portForwardingConfig={};for(const rule of config)
this._config.portForwardingConfig[rule.port]=rule.address;InspectorFrontendHost.setDevicesDiscoveryConfig(this._config);});this._portForwardingView.show(this.element);}
discoveryConfigChanged(config){this._config=config;this._discoverUsbDevicesCheckbox.checked=config.discoverUsbDevices;this._portForwardingView.discoveryConfigChanged(config.portForwardingEnabled,config.portForwardingConfig);}};Devices.DevicesView.PortForwardingView=class extends UI.VBox{constructor(callback){super();this._callback=callback;this.element.classList.add('port-forwarding-view');const portForwardingHeader=this.element.createChild('div','port-forwarding-header');const portForwardingEnabledCheckbox=UI.CheckboxLabel.create(Common.UIString('Port forwarding'));portForwardingEnabledCheckbox.classList.add('port-forwarding-checkbox');portForwardingHeader.appendChild(portForwardingEnabledCheckbox);this._portForwardingEnabledCheckbox=portForwardingEnabledCheckbox.checkboxElement;this._portForwardingEnabledCheckbox.addEventListener('click',this._update.bind(this),false);const portForwardingFooter=this.element.createChild('div','port-forwarding-footer');portForwardingFooter.createChild('span').textContent=Common.UIString('Define the listening port on your device that maps to a port accessible from your development machine. ');portForwardingFooter.appendChild(UI.XLink.create('https://developer.chrome.com/devtools/docs/remote-debugging#port-forwarding',Common.UIString('Learn more')));this._list=new UI.ListWidget(this);this._list.registerRequiredCSS('devices/devicesView.css');this._list.element.classList.add('port-forwarding-list');const placeholder=createElementWithClass('div','port-forwarding-list-empty');placeholder.textContent=Common.UIString('No rules');this._list.setEmptyPlaceholder(placeholder);this._list.show(this.element);this._editor=null;this.element.appendChild(UI.createTextButton(Common.UIString('Add rule'),this._addRuleButtonClicked.bind(this),'add-rule-button'));this._portForwardingConfig=[];}
_update(){this._callback.call(null,this._portForwardingEnabledCheckbox.checked,this._portForwardingConfig);}
_addRuleButtonClicked(){this._list.addNewItem(this._portForwardingConfig.length,{port:'',address:''});}
discoveryConfigChanged(portForwardingEnabled,portForwardingConfig){this._portForwardingEnabledCheckbox.checked=portForwardingEnabled;this._portForwardingConfig=[];this._list.clear();for(const key of Object.keys(portForwardingConfig)){const rule=({port:key,address:portForwardingConfig[key]});this._portForwardingConfig.push(rule);this._list.appendItem(rule,true);}}
renderItem(rule,editable){const element=createElementWithClass('div','port-forwarding-list-item');const port=element.createChild('div','port-forwarding-value port-forwarding-port');port.createChild('span','port-localhost').textContent=Common.UIString('localhost:');port.createTextChild(rule.port);element.createChild('div','port-forwarding-separator');element.createChild('div','port-forwarding-value').textContent=rule.address;return element;}
removeItemRequested(rule,index){this._portForwardingConfig.splice(index,1);this._list.removeItem(index);this._update();}
commitEdit(rule,editor,isNew){rule.port=editor.control('port').value.trim();rule.address=editor.control('address').value.trim();if(isNew)
this._portForwardingConfig.push(rule);this._update();}
beginEdit(rule){const editor=this._createEditor();editor.control('port').value=rule.port;editor.control('address').value=rule.address;return editor;}
_createEditor(){if(this._editor)
return this._editor;const editor=new UI.ListWidget.Editor();this._editor=editor;const content=editor.contentElement();const fields=content.createChild('div','port-forwarding-edit-row');fields.createChild('div','port-forwarding-value port-forwarding-port').appendChild(editor.createInput('port','text','Device port (3333)',portValidator.bind(this)));fields.createChild('div','port-forwarding-separator port-forwarding-separator-invisible');fields.createChild('div','port-forwarding-value').appendChild(editor.createInput('address','text','Local address (dev.example.corp:3333)',addressValidator));return editor;function portValidator(rule,index,input){const value=input.value.trim();const match=value.match(/^(\d+)$/);if(!match)
return false;const port=parseInt(match[1],10);if(port<1024||port>65535)
return false;for(let i=0;i<this._portForwardingConfig.length;++i){if(i!==index&&this._portForwardingConfig[i].port===value)
return false;}
return true;}
function addressValidator(rule,index,input){const match=input.value.trim().match(/^([a-zA-Z0-9\.\-_]+):(\d+)$/);if(!match)
return false;const port=parseInt(match[2],10);return port<=65535;}}};Devices.DevicesView.DeviceView=class extends UI.VBox{constructor(){super();this.setMinimumSize(100,100);this.contentElement.classList.add('device-view');const topRow=this.contentElement.createChild('div','hbox device-text-row');this._deviceTitle=topRow.createChild('div','view-title');this._deviceSerial=topRow.createChild('div','device-serial');this._portStatus=this.contentElement.createChild('div','device-port-status hidden');this._deviceOffline=this.contentElement.createChild('div');this._deviceOffline.textContent=Common.UIString('Pending authentication: please accept debugging session on the device.');this._noBrowsers=this.contentElement.createChild('div');this._noBrowsers.textContent=Common.UIString('No browsers detected.');this._browsers=this.contentElement.createChild('div','device-browser-list vbox');this._browserById=new Map();this._cachedPortStatus=null;this._device=null;}
update(device){if(!this._device||this._device.adbModel!==device.adbModel)
this._deviceTitle.textContent=device.adbModel;if(!this._device||this._device.adbSerial!==device.adbSerial)
this._deviceSerial.textContent='#'+device.adbSerial;this._deviceOffline.classList.toggle('hidden',device.adbConnected);this._noBrowsers.classList.toggle('hidden',!device.adbConnected||!!device.browsers.length);this._browsers.classList.toggle('hidden',!device.adbConnected||!device.browsers.length);const browserIds=new Set();for(const browser of device.browsers)
browserIds.add(browser.id);for(const browserId of this._browserById.keys()){if(!browserIds.has(browserId)){this._browserById.get(browserId).element.remove();this._browserById.remove(browserId);}}
for(const browser of device.browsers){let section=this._browserById.get(browser.id);if(!section){section=this._createBrowserSection();this._browserById.set(browser.id,section);this._browsers.appendChild(section.element);}
this._updateBrowserSection(section,browser);}
this._device=device;}
_createBrowserSection(){const element=createElementWithClass('div','vbox flex-none');const topRow=element.createChild('div','');const title=topRow.createChild('div','device-browser-title');const newTabRow=element.createChild('div','device-browser-new-tab');newTabRow.createChild('div','').textContent=Common.UIString('New tab:');const newTabInput=UI.createInput('','text');newTabRow.appendChild(newTabInput);newTabInput.placeholder=Common.UIString('Enter URL');newTabInput.addEventListener('keydown',newTabKeyDown,false);const newTabButton=UI.createTextButton(Common.UIString('Open'),openNewTab);newTabRow.appendChild(newTabButton);const pages=element.createChild('div','device-page-list vbox');const viewMore=element.createChild('div','device-view-more');viewMore.addEventListener('click',viewMoreClick,false);updateViewMoreTitle();const section={browser:null,element:element,title:title,pages:pages,viewMore:viewMore,newTab:newTabRow,pageSections:new Map()};return section;function viewMoreClick(){pages.classList.toggle('device-view-more-toggled');updateViewMoreTitle();}
function updateViewMoreTitle(){viewMore.textContent=pages.classList.contains('device-view-more-toggled')?Common.UIString('View less tabs\u2026'):Common.UIString('View more tabs\u2026');}
function newTabKeyDown(event){if(event.key==='Enter'){event.consume(true);openNewTab();}}
function openNewTab(){if(section.browser){InspectorFrontendHost.openRemotePage(section.browser.id,newTabInput.value.trim()||'about:blank');newTabInput.value='';}}}
_updateBrowserSection(section,browser){if(!section.browser||section.browser.adbBrowserName!==browser.adbBrowserName||section.browser.adbBrowserVersion!==browser.adbBrowserVersion){if(browser.adbBrowserVersion)
section.title.textContent=String.sprintf('%s (%s)',browser.adbBrowserName,browser.adbBrowserVersion);else
section.title.textContent=browser.adbBrowserName;}
const pageIds=new Set();for(const page of browser.pages)
pageIds.add(page.id);for(const pageId of section.pageSections.keys()){if(!pageIds.has(pageId)){section.pageSections.get(pageId).element.remove();section.pageSections.remove(pageId);}}
for(let index=0;index<browser.pages.length;++index){const page=browser.pages[index];let pageSection=section.pageSections.get(page.id);if(!pageSection){pageSection=this._createPageSection();section.pageSections.set(page.id,pageSection);section.pages.appendChild(pageSection.element);}
this._updatePageSection(pageSection,page);if(!index&&section.pages.firstChild!==pageSection.element)
section.pages.insertBefore(pageSection.element,section.pages.firstChild);}
const kViewMoreCount=3;for(let index=0,element=section.pages.firstChild;element;element=element.nextSibling,++index)
element.classList.toggle('device-view-more-page',index>=kViewMoreCount);section.viewMore.classList.toggle('device-needs-view-more',browser.pages.length>kViewMoreCount);section.newTab.classList.toggle('hidden',!browser.adbBrowserChromeVersion);section.browser=browser;}
_createPageSection(){const element=createElementWithClass('div','vbox');const titleRow=element.createChild('div','device-page-title-row');const title=titleRow.createChild('div','device-page-title');const inspect=UI.createTextButton(Common.UIString('Inspect'),doAction.bind(null,'inspect'));titleRow.appendChild(inspect);const toolbar=new UI.Toolbar('');toolbar.appendToolbarItem(new UI.ToolbarMenuButton(appendActions));titleRow.appendChild(toolbar.element);const url=element.createChild('div','device-page-url');const section={page:null,element:element,title:title,url:url,inspect:inspect};return section;function appendActions(contextMenu){contextMenu.defaultSection().appendItem(Common.UIString('Reload'),doAction.bind(null,'reload'));contextMenu.defaultSection().appendItem(Common.UIString('Focus'),doAction.bind(null,'activate'));contextMenu.defaultSection().appendItem(Common.UIString('Close'),doAction.bind(null,'close'));}
function doAction(action){if(section.page)
InspectorFrontendHost.performActionOnRemotePage(section.page.id,action);}}
_updatePageSection(section,page){if(!section.page||section.page.name!==page.name){section.title.textContent=page.name;section.title.title=page.name;}
if(!section.page||section.page.url!==page.url){section.url.textContent='';section.url.appendChild(UI.XLink.create(page.url));}
section.inspect.disabled=page.attached;section.page=page;}
portForwardingStatusChanged(status){const json=JSON.stringify(status);if(json===this._cachedPortStatus)
return;this._cachedPortStatus=json;this._portStatus.removeChildren();this._portStatus.createChild('div','device-port-status-text').textContent=Common.UIString('Port Forwarding:');const connected=[];const transient=[];const error=[];let empty=true;for(const port in status.ports){if(!status.ports.hasOwnProperty(port))
continue;empty=false;const portStatus=status.ports[port];const portNumber=createElementWithClass('div','device-view-port-number monospace');portNumber.textContent=':'+port;if(portStatus>=0)
this._portStatus.appendChild(portNumber);else
this._portStatus.insertBefore(portNumber,this._portStatus.firstChild);const portIcon=createElementWithClass('div','device-view-port-icon');if(portStatus>=0){connected.push(port);}else if(portStatus===-1||portStatus===-2){portIcon.classList.add('device-view-port-icon-transient');transient.push(port);}else if(portStatus<0){portIcon.classList.add('device-view-port-icon-error');error.push(port);}
this._portStatus.insertBefore(portIcon,portNumber);}
const title=[];if(connected.length)
title.push(Common.UIString('Connected: %s',connected.join(', ')));if(transient.length)
title.push(Common.UIString('Transient: %s',transient.join(', ')));if(error.length)
title.push(Common.UIString('Error: %s',error.join(', ')));this._portStatus.title=title.join('; ');this._portStatus.classList.toggle('hidden',empty);}};Devices.DevicesView.BrowserSection;Devices.DevicesView.PageSection;;Runtime.cachedResources["devices/devicesView.css"]="/*\n * Copyright (c) 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.devices-container {\n    overflow: hidden;\n    flex: auto;\n}\n\n.devices-sidebar {\n    flex: 0 0 150px;\n    display: flex;\n    flex-direction: column;\n    align-items: stretch;\n    margin: 15px 10px 0 0;\n}\n\n.devices-sidebar-list {\n    flex: auto;\n    display: flex;\n    flex-direction: column;\n    align-items: stretch;\n    overflow: auto;\n}\n\n.devices-sidebar-item {\n    color: #222 !important;\n    padding: 6px 6px 6px 16px;\n    flex: auto;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    font-size: 14px;\n    flex: none;\n}\n\n.devices-sidebar-item.selected {\n    border-left: 6px solid #666 !important;\n    padding-left: 10px;\n}\n\n.devices-sidebar-item-status:before {\n    content: \"\\25cf\";\n    font-size: 16px;\n    color: red;\n    position: relative;\n    top: 1px;\n    margin-right: 2px;\n}\n\n.devices-sidebar-item.device-connected .devices-sidebar-item-status:before {\n    color: green;\n}\n\n.devices-sidebar-spacer {\n    flex: none;\n}\n\n.devices-view-title {\n    font-size: 16px;\n    margin: 0 0 15px 15px;\n    padding-top: 1px;\n    flex: none;\n}\n\n.view-title {\n    font-size: 16px;\n    flex: none;\n}\n\n.devices-footer {\n    border-top: 1px solid #cdcdcd;\n    background-color: var(--toolbar-bg-color);\n    flex: none;\n    padding: 3px 10px;\n    overflow: hidden;\n}\n\n.devices-footer > span {\n    white-space: pre;\n}\n\n.discovery-view {\n    overflow-x: hidden;\n    overflow-y: auto;\n    padding: 15px 15px 0px 0px;\n}\n\n.discovery-view > * {\n    flex: none;\n}\n\n.usb-checkbox {\n    padding-bottom: 8px;\n    margin-top: 20px;\n}\n\n.port-forwarding-header {\n    display: flex;\n    align-items: center;\n    flex-direction: row;\n    margin-top: 5px;\n}\n\n.add-rule-button {\n    margin: 10px 25px;\n    align-self: flex-start;\n}\n\n.discovery-help {\n    margin: 5px 0 25px 25px;\n}\n\n.discovery-help > span {\n    white-space: pre;\n}\n\n.port-forwarding-list {\n    margin: 10px 0 0 25px;\n    max-width: 500px;\n    flex: none;\n}\n\n.port-forwarding-list-empty {\n    flex: auto;\n    height: 30px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.port-forwarding-list-item {\n    padding: 3px 5px 3px 5px;\n    height: 30px;\n    display: flex;\n    align-items: center;\n    position: relative;\n    flex: auto 1 1;\n}\n\n.list-item .port-forwarding-value {\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    -webkit-user-select: none;\n    color: #222;\n    overflow: hidden;\n}\n\n.port-forwarding-value {\n    flex: 3 1 0;\n}\n\n.port-forwarding-value.port-forwarding-port {\n    flex: 1 1 0;\n}\n\n.port-localhost {\n    color: #aaa;\n}\n\n.port-forwarding-separator {\n    flex: 0 0 1px;\n    background-color: rgb(231, 231, 231);\n    height: 30px;\n    margin: 0 4px;\n}\n\n.port-forwarding-separator-invisible {\n    visibility: hidden;\n    height: 100% !important;\n}\n\n.port-forwarding-edit-row {\n    flex: none;\n    display: flex;\n    flex-direction: row;\n    margin: 6px 5px;\n    align-items: center;\n}\n\n.port-forwarding-edit-row input {\n    width: 100%;\n    text-align: inherit;\n}\n\n.port-forwarding-footer {\n    overflow: hidden;\n    margin: 15px 0 0 25px;\n    max-width: 500px;\n}\n\n.port-forwarding-footer > * {\n    white-space: pre-wrap;\n}\n\n.network-discovery-header {\n    display: flex;\n    align-items: center;\n    flex-direction: row;\n    margin-top: 5px;\n}\n\n.add-network-target-button {\n    margin: 10px 25px;\n    align-self: flex-start;\n}\n\n.network-discovery-list {\n    margin: 10px 0 0 25px;\n    max-width: 500px;\n    flex: none;\n}\n\n.network-discovery-list-empty {\n    flex: auto;\n    height: 30px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.network-discovery-list-item {\n    padding: 3px 5px 3px 5px;\n    height: 30px;\n    display: flex;\n    align-items: center;\n    position: relative;\n    flex: auto 1 1;\n}\n\n.list-item .network-discovery-value {\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    -webkit-user-select: none;\n    color: #222;\n    overflow: hidden;\n}\n\n.network-discovery-value {\n    flex: 3 1 0;\n}\n\n.network-discovery-edit-row {\n    flex: none;\n    display: flex;\n    flex-direction: row;\n    margin: 6px 5px;\n    align-items: center;\n}\n\n.network-discovery-edit-row input {\n    width: 100%;\n    text-align: inherit;\n}\n\n.network-discovery-footer {\n    overflow: hidden;\n    margin: 15px 0 0 25px;\n    max-width: 500px;\n}\n\n.network-discovery-footer > * {\n    white-space: pre-wrap;\n}\n\n.device-view {\n    overflow: auto;\n    -webkit-user-select: text;\n    flex: auto;\n    padding-top: 15px;\n}\n\n.device-text-row {\n    align-items: baseline;\n    margin-right: 25px;\n}\n\n.device-serial {\n    color: #777;\n    margin-left: 5px;\n    flex: none;\n}\n\n.device-browser-list {\n    flex: auto;\n    overflow: auto;\n    padding-right: 10px;\n    margin-top: 30px;\n}\n\n.device-browser-list > div {\n    margin-bottom: 15px;\n}\n\n.device-browser-title {\n    font-size: 16px;\n}\n\n.device-browser-new-tab {\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    margin: 10px 0 0 10px;\n}\n\n.device-browser-new-tab > div {\n    font-size: 13px;\n}\n\n.device-browser-new-tab > input {\n    margin: 0 10px;\n}\n\n.device-page-list {\n    margin: 10px 0 0 10px;\n    overflow-x: auto;\n    align-items: stretch;\n    flex: none;\n}\n\n.device-page-list > div {\n    flex: none;\n    padding: 5px 0;\n}\n\n.device-page-list:not(.device-view-more-toggled) > div.device-view-more-page {\n    display: none;\n}\n\n.device-page-title-row {\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n}\n\n.device-page-title {\n    font-size: 15px;\n    flex: auto;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    overflow: hidden;\n}\n\n.device-page-title-row .toolbar {\n    margin-left: 3px;\n    padding: 0;\n    border-radius: 3px;\n}\n\n.device-page-title-row .toolbar:hover {\n    background-color: hsl(0, 0%, 90%);\n}\n\n.device-page-url {\n    margin: 3px 100px 3px 0;\n}\n\n.device-page-url a {\n    color: #777;\n    word-break: break-all;\n}\n\n.device-view-more {\n    cursor: pointer;\n    text-decoration: underline;\n    color: rgb(17, 85, 204);\n    margin: 5px 0 0 10px;\n    display: none;\n}\n\n.device-view-more.device-needs-view-more  {\n    display: block;\n}\n\n.device-port-status {\n    overflow: hidden;\n    flex: none;\n    display: flex;\n    align-items: baseline;\n    margin: 10px 0 0 10px;\n}\n\n.device-port-status-text {\n    margin-right: 10px;\n}\n\n.device-view-port-icon {\n    background-color: green;\n    border: 0 solid transparent;\n    border-radius: 6px;\n    height: 12px;\n    width: 12px;\n    position: relative;\n    top: 2px;\n    flex: none;\n}\n\n.device-view-port-number {\n    margin: 0 10px 0 2px;\n    flex: none;\n}\n\n.device-view-port-icon.device-view-port-icon-error {\n    background-color: red;\n}\n\n.device-view-port-icon.device-view-port-icon-transient {\n    transform: scale(1.2);\n    background-color: orange;\n}\n\n/*# sourceURL=devices/devicesView.css */";