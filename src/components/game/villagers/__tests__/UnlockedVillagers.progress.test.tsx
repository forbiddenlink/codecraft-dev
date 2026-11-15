import {act,cleanup,render,screen} from '@testing-library/react';
import {configureStore} from '@reduxjs/toolkit';
import {Provider} from 'react-redux';
import challengeReducer,{completeChallenge} from '@/store/slices/challengeSlice';
import UnlockedVillagers from '../UnlockedVillagers';
jest.mock('@/components/game/villager/VillagerMesh',()=>({__esModule:true,default:({villager}:any)=><span>{villager.id}</span>}));
jest.mock('@/data/villagers',()=>({getAvailableVillagers:(_level:number,completed:string[])=>completed.includes('synthetic')?[{id:'Synthetic villager',location:{position:[0,0,0]}}]:[]}));
afterEach(()=>{cleanup();jest.restoreAllMocks()});
it('reacts to shared completions without a second persistence hook',()=>{
 const write=jest.spyOn(Storage.prototype,'setItem');
 const store=configureStore({reducer:{challenges:challengeReducer,user:()=>({progress:{level:1}})}});
 render(<Provider store={store}><UnlockedVillagers/></Provider>);
 expect(screen.queryByText('Synthetic villager')).toBeNull();
 act(()=>{store.dispatch(completeChallenge('synthetic'))});
 expect(screen.queryByText('Synthetic villager')).not.toBeNull();
 expect(write).not.toHaveBeenCalled();
});
