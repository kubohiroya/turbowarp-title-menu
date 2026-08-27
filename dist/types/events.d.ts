import type { DslFileRecord } from './dsl-storage';
export declare const dslOpenEventName = "turbowarp-title-menu:dsl-open";
export declare const dslReloadEventName = "turbowarp-title-menu:dsl-reload";
export interface DslSourceEventDetail {
    record: DslFileRecord;
}
export declare function dispatchDslSourceEvent(type: string, record: DslFileRecord): void;
