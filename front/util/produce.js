import { enableES5, produce } from 'immer';

const Produce = (...args) => {
  enableES5();
  return produce(...args);
};

export default Produce;
