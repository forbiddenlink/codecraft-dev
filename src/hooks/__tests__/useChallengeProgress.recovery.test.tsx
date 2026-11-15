import {act,renderHook,cleanup} from '@testing-library/react';
import {useChallengeProgress} from '../useChallengeProgress';
const mockDispatch=jest.fn();
jest.mock('@/store/hooks',()=>({useAppDispatch:()=>mockDispatch}));
jest.mock('@/data/buildingIds',()=>({resolveBuildingTemplateId:(id:string)=>id}));
jest.mock('@/data/challenges',()=>({getChallengeById:(id:string)=>({id,requiredChallenges:[],rewards:[],difficulty:1})}));
jest.mock('@/store/slices/buildingSlice',()=>({unlockBuilding:jest.fn()}));
jest.mock('@/store/slices/challengeSlice',()=>({completeChallenge:jest.fn(),hydrateCompletedChallenges:jest.fn()}));
jest.mock('@/store/slices/resourceSlice',()=>({addResources:jest.fn()}));
jest.mock('@/store/slices/userSlice',()=>({completeChallenge:jest.fn()}));
jest.mock('@/store/slices/villagerSlice',()=>({unlockVillager:jest.fn()}));
jest.mock('@/utils/hapticFeedback',()=>({__esModule:true,default:{challengeComplete:jest.fn(),levelUp:jest.fn(),achievement:jest.fn()}}));
jest.mock('@/utils/spacedRepetition',()=>({recordChallengeCompletion:jest.fn()}));
beforeEach(()=>localStorage.clear());afterEach(()=>{cleanup();jest.restoreAllMocks()});
it.each(['{broken','{}','null','[1]'])('preserves malformed progress %s and warns',raw=>{
 localStorage.setItem('completed-challenges',raw);
 const {result}=renderHook(()=>useChallengeProgress());
 expect(result.current.completed).toEqual([]);
 expect(result.current.progressSaveError).toContain('could not be read');
 act(()=>result.current.completeChallenge('synthetic'));
 expect(localStorage.getItem('completed-challenges')).toBe(raw);
});
it('handles inaccessible storage without crashing',()=>{
 jest.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw Error('denied')});
 const {result}=renderHook(()=>useChallengeProgress());
 expect(result.current.progressSaveError).toContain('could not be read');
});
it('keeps valid progress and saves new completion',()=>{
 localStorage.setItem('completed-challenges','["earlier"]');
 const {result}=renderHook(()=>useChallengeProgress());
 expect(result.current.completed).toEqual(['earlier']);
 act(()=>result.current.completeChallenge('synthetic'));
 expect(JSON.parse(localStorage.getItem('completed-challenges')!)).toEqual(['earlier','synthetic']);
 expect(result.current.progressSaveError).toBeNull();
});
it('warns on failed writes while retaining in-memory completion',()=>{
 const {result}=renderHook(()=>useChallengeProgress());
 jest.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('quota')});
 expect(()=>act(()=>result.current.completeChallenge('synthetic'))).not.toThrow();
 expect(result.current.completed).toContain('synthetic');
 expect(result.current.progressSaveError).toContain('could not be saved');
});

it('explicit retry saves pending completions and confirms without another challenge',()=>{
 const {result}=renderHook(()=>useChallengeProgress());
 const write=jest.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('quota')});
 act(()=>result.current.completeChallenge('synthetic'));
 expect(result.current.progressSaveMessage).toBeNull();
 expect(result.current.canRetrySave).toBe(true);
 write.mockRestore();
 expect(localStorage.getItem('completed-challenges')).toBe('[]');
 act(()=>{expect(result.current.retrySaveProgress()).toBe(true)});
 expect(JSON.parse(localStorage.getItem('completed-challenges')!)).toEqual(['synthetic']);
 expect(result.current.progressSaveError).toBeNull();
 expect(result.current.progressSaveMessage).toContain('saved in this browser');
});
it('failed retry never claims success',()=>{
 const {result}=renderHook(()=>useChallengeProgress());
 jest.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('quota')});
 act(()=>{expect(result.current.retrySaveProgress()).toBe(false)});
 expect(result.current.progressSaveMessage).toBeNull();
 expect(result.current.progressSaveError).toContain('wait for confirmation');
});
it('retry cannot overwrite an unreadable original record',()=>{
 localStorage.setItem('completed-challenges','{broken');
 const {result}=renderHook(()=>useChallengeProgress());
 expect(result.current.canRetrySave).toBe(false);
 act(()=>{expect(result.current.retrySaveProgress()).toBe(false)});
 expect(localStorage.getItem('completed-challenges')).toBe('{broken');
 expect(result.current.progressSaveMessage).toBeNull();
});
