# Operations Contract

## Purpose

This contract defines the operational expectations for QiArchive as always-on infrastructure.

## Required Operational Behavior

- ingestion should be background-first
- runtime should restart automatically after failures or reboot
- persistence must survive redeploys
- failure states should be visible
- normal usage should not depend on memory

## Minimum Operational Requirements

- persistent storage
- health visibility
- queue visibility
- duplicate reporting
- error isolation

## Success Condition

The system is working correctly when a user can drop a file into the inbox and trust that the pipeline will handle it without further manual babysitting.
