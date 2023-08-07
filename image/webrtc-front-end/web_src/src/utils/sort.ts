import { VersionModel } from "../android/models/android";
import { VersionOriginalModel } from "../core/models/shared";

export const sortAndroidList = (list: VersionOriginalModel[]): VersionModel[] => {
  return list
    .sort((prev: VersionOriginalModel, next: VersionOriginalModel): number =>
      next.create_date.localeCompare(prev.create_date)
    )
    .map((item: VersionOriginalModel, i: number): VersionModel =>
      ({ key: i, tag: item.tag, node: [], createDate: item.create_date })
    );
};

export const sortTestList = (list: VersionOriginalModel[]): VersionOriginalModel[] => {
  return list.sort((prev: VersionOriginalModel, next: VersionOriginalModel): number =>
    next.create_date.localeCompare(prev.create_date)
  );
};
