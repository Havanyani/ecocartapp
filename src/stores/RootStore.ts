import { makeAutoObservable } from 'mobx';
import { CollectionStore } from './CollectionStore';
import { SustainabilityStore } from './SustainabilityStore';
import { UserStore } from './UserStore';

export class RootStore {
  userStore: UserStore;
  collectionStore: CollectionStore;
  sustainabilityStore: SustainabilityStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.collectionStore = new CollectionStore(this);
    this.sustainabilityStore = new SustainabilityStore(this);
    makeAutoObservable(this);
  }
}

export const rootStore = new RootStore(); 