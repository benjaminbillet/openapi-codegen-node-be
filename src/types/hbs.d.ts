declare module '*.hbs' {
  const template: {
    compiler: [number, string];
    useData: true;
    main: () => void;
  };
  export default template;
}
