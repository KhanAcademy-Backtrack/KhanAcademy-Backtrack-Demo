import type {ProgramState} from './store.ts';

/** Keep an unfinished check resumable; allocate another seed after submission.
 * A UUID stays fresh after the bounded attempt/check history has been trimmed. */
export function freshCheckKey(state:Pick<ProgramState,'attempts'>,kind:'topic'|'exit',concept:string,today:string):string{
 const prefix=`${kind}~${concept}|`;
 const open=state.attempts.find(a=>a.formKey.startsWith(prefix)&&a.submittedAt===undefined);
 return open?.formKey??`${prefix}${today.replace(/-/g,'')}-${crypto.randomUUID()}`;
}
