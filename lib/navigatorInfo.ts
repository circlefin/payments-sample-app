function getIsSafari() {
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor;
    return userAgent.toLowerCase().includes('safari') && vendor.toLowerCase().includes('apple computer');
  }

  export { getIsSafari }
